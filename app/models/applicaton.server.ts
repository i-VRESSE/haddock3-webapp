import JSZip from "jszip";
import { stringify, parse } from "@ltd/j-toml";

import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "../bartender-client/constants";
import { createClient, multipart } from "./config.server";
import { getJobById } from "./job.server";
import {
  dedupWorkflow,
  parseWorkflowFromTable,
} from "@i-vresse/wb-core/dist/toml.js";
import { BartenderError, InvalidUploadError } from "./errors";
import { ExpertiseLevel } from "@prisma/client";
import type { IFiles, IWorkflow } from "@i-vresse/wb-core/dist/types";
import {
  Errors,
  ValidationError,
  validateWorkflow,
} from "@i-vresse/wb-core/dist/validate.js";
import { getCatalog } from "~/catalogs/index.server";

export async function submitJob(
  upload: File,
  accessToken: string,
  expertiseLevels: ExpertiseLevel[]
) {
  const rewritten_blob = await rewriteConfigInArchive(upload, expertiseLevels);
  const rewritten_upload = new File([rewritten_blob], upload.name, {
    type: upload.type,
    lastModified: upload.lastModified,
  });

  const body = { upload: rewritten_upload };
  const client = createClient(accessToken);
  // Redirect manual is needed because authorization header is not passed
  const { response } = await client.PUT("/api/application/haddock3", {
    redirect: "manual",
    body,
    bodySerializer: multipart,
  });
  if (!response.ok && response.status !== 303) {
    throw new BartenderError(
      `Unable to submit job: ${response.status} ${
        response.statusText
      } ${await response.text()}`
    );
  }

  const url = response.headers.get("Location");
  // url is like /api/job/1234
  const jobId = parseInt(url!.split("/").pop()!);
  return getJobById(jobId, accessToken);
}

/**
 * Rewrite the workflow config with
 *
 * * Force run_dir to JOB_OUTPUT_DIR
 *      -> To make run_dir predictable so results can be shown
 * * Force mode to 'local' and remove remove all other fields in execution group
 *      -> To make the web site in charge of how job is executed
 * * Force postprocess to true
 *      -> To have some html files in run_dir that can be shown
 *
 * @param config_body Body of workflow config file to rewrite
 * @returns The rewritten config file
 */
function rewriteConfig(table: ReturnType<typeof parse>) {
  table.run_dir = JOB_OUTPUT_DIR;
  table.mode = "local";
  table.postprocess = true;
  table.clean = true;

  const haddock3_ncores = getNCores();
  if (haddock3_ncores > 0) {
    table.ncores = haddock3_ncores;
  } else {
    delete table.ncores;
  }
  delete table.max_cpus;
  delete table.batch_type;
  delete table.queue;
  delete table.queue_limit;
  delete table.concat;
  delete table.self_contained;
  delete table.cns_exec;
  return table;
}

/**
 *
 * @returns Number of cores to use for haddock3. 0 means use default.
 */
function getNCores() {
  let haddock3_ncores = 0;
  if (
    process.env.HADDOCK3_NCORES !== undefined &&
    process.env.HADDOCK3_NCORES !== ""
  ) {
    haddock3_ncores = parseInt(process.env.HADDOCK3_NCORES);
    if (isNaN(haddock3_ncores)) {
      throw new Error(
        `HADDOCK3_NCORES env var is not a number: ${process.env.HADDOCK3_NCORES}`
      );
    }
  }
  return haddock3_ncores;
}

function parseToml(toml: string) {
  try {
    return parse(dedupWorkflow(toml), { bigint: false });
  } catch (error) {
    if (error instanceof Error) {
      throw new InvalidUploadError(`Invalid ${WORKFLOW_CONFIG_FILENAME} file`, {
        cause: error,
      });
    }
    throw error;
  }
}

export async function rewriteConfigInArchive(
  upload: Blob,
  expertiseLevels: ExpertiseLevel[]
) {
  const zip = new JSZip();
  // Tried to give upload blob directly to loadAsync, but failed with
  // Error: Can't read the data of 'the loaded zip file'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?
  // however converting to array buffer works, but will load entire file into memory
  try {
    await zip.loadAsync(await upload.arrayBuffer());
  } catch (e) {
    if (e instanceof Error) {
      throw new InvalidUploadError(`Unable to read archive`, { cause: e });
    }
    throw e;
  }
  const config_file = zip.file(WORKFLOW_CONFIG_FILENAME);
  if (config_file === null) {
    throw new InvalidUploadError(
      `Unable to find ${WORKFLOW_CONFIG_FILENAME} in archive`
    );
  }
  const config_body = await config_file.async("string");

  // Keep backup of original config, before rewriting it
  zip.file(`${WORKFLOW_CONFIG_FILENAME}.orig`, config_body);

  const table = parseToml(config_body);
  const new_table = rewriteConfig(table);

  const new_config = parseWorkflowFromTable(new_table, getCatalog("guru"));
  await validateWorkflowAgainstExpertiseLevels(
    new_config,
    expertiseLevels,
    zip
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const new_config_body = stringify(new_table as any, {
    newline: "\n",
    indent: 2,
    integer: Number.MAX_SAFE_INTEGER,
  });

  zip.file(WORKFLOW_CONFIG_FILENAME, new_config_body);
  return await zip.generateAsync({ type: "blob" });
}

async function validateWorkflowAgainstExpertiseLevels(
  workflow: IWorkflow,
  expertiseLevels: ExpertiseLevel[],
  zip: JSZip
) {
  const files = await filesFromZip(zip);
  let errors: Errors = [];
  if (expertiseLevels.length === 0) {
    throw new ValidationError("No expertise levels provided", []);
  }
  for (const expertiseLevel of expertiseLevels) {
    const catalog = getCatalog(expertiseLevel);
    errors = await validateWorkflow(workflow, catalog, files);
    if (errors.length === 0) {
      // If workflow is valid for any expertise level, then it's valid
      return;
    }
  }
  throw new ValidationError("Invalid workflow", errors);
}

async function filesFromZip(zip: JSZip): Promise<IFiles> {
  const blobs: Promise<[string, string]>[] = [];
  zip.forEach((relativePath, file) => {
    if (
      relativePath === WORKFLOW_CONFIG_FILENAME ||
      relativePath === `${WORKFLOW_CONFIG_FILENAME}.orig`
    ) {
      // Skip workflow config file
      return;
    }
    blobs.push(
      file.async("blob").then((blob) => blob2dataurl(blob, relativePath))
    );
  });
  const dataurls = await Promise.all(blobs);
  return Object.fromEntries(dataurls);
}

async function blob2dataurl(
  value: Blob,
  path: string
): Promise<[string, string]> {
  const base64 = Buffer.from(await value.arrayBuffer()).toString("base64");
  const dataurl = `data:${value.type};name=${path};base64,${base64}`;
  return [path, dataurl];
}
