import JSZip from "jszip";
import { stringify, parse } from "@ltd/j-toml";

import { JOB_OUTPUT_DIR, WORKFLOW_CONFIG_FILENAME } from "./constants";
import { createClient, multipart } from "./config.server";
import { getJobById } from "./job.server";

export async function submitJob(upload: File, accessToken: string) {
  const client = createClient(accessToken);

  const rewritten_upload = new File(
    [await rewriteConfigInArchive(upload)],
    upload.name,
    {
      type: upload.type,
      lastModified: upload.lastModified,
    }
  );
  const body = { upload: rewritten_upload };
  // Redirect manual is needed because authorization header is not passed
  const { response } = await client.PUT("/api/application/haddock3", {
    redirect: "manual",
    body,
    bodySerializer: multipart,
  });
  if (!response.ok && response.status !== 303) {
    throw new Error(
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
async function rewriteConfig(config_body: string) {
  const { dedupWorkflow } = await import("@i-vresse/wb-core/dist/toml.js");
  const table = parse(dedupWorkflow(config_body), { bigint: false });
  table.run_dir = JOB_OUTPUT_DIR;
  table.mode = "local";
  table.postprocess = true;
  table.clean = true;
  delete table.ncores;
  delete table.batch_type;
  delete table.queue;
  delete table.queue_limit;
  delete table.concat;
  delete table.self_contained;
  delete table.cns_exec;

  return stringify(table as any, {
    newline: "\n",
    indent: 2,
    integer: Number.MAX_SAFE_INTEGER,
  });
}

export async function rewriteConfigInArchive(upload: Blob) {
  const zip = new JSZip();
  // Tried to give upload blob directly to loadAsync, but failed with
  // Error: Can't read the data of 'the loaded zip file'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?
  // however converting to array buffer works.
  await zip.loadAsync(await upload.arrayBuffer());
  const config_file = zip.file(WORKFLOW_CONFIG_FILENAME);
  if (config_file === null) {
    throw new Error(`Unable to find ${WORKFLOW_CONFIG_FILENAME} in archive`);
  }
  const config_body = await config_file.async("string");
  zip.file(`${WORKFLOW_CONFIG_FILENAME}.orig`, config_body);

  // TODO validate config using catalog and ajv
  // now have to wait for job to run before its validated

  const new_config = await rewriteConfig(config_body);

  zip.file(WORKFLOW_CONFIG_FILENAME, new_config);
  return await zip.generateAsync({ type: "blob" });
}
