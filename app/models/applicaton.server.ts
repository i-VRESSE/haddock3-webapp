import type { ZipEntry, ZipFileEntry } from "@zip.js/zip.js";
import { fs } from "@zip.js/zip.js";
import { stringify, parse } from "@ltd/j-toml";

import { ApplicationApi } from "~/bartender-client/apis/ApplicationApi";
import type { JobModelDTO } from "~/bartender-client/models/JobModelDTO";
import { buildConfig } from "./config.server";

export const WORKFLOW_CONFIG_FILENAME = "workflow.cfg";
const JOB_OUTPUT_DIR = "output";

function buildApplicationApi(accessToken: string = "") {
  return new ApplicationApi(buildConfig(accessToken));
}

export async function applicationNames() {
  const api = buildApplicationApi();
  return await api.listApplicationsApiApplicationGet();
}

export async function applicationByName(name: string) {
  const api = buildApplicationApi();
  return await api.getApplicationApiApplicationApplicationGet({
    application: name,
  });
}

export async function submitJob(
  application: string,
  upload: File,
  accessToken: string
) {
  console.log({ application, upload, accessToken });
  const api = buildApplicationApi(accessToken);
  const rewritten_upload = await rewriteConfigInArchive(upload);
  const response = await api.uploadJobApiApplicationApplicationJobPutRaw({
    application,
    upload: rewritten_upload,
  });
  const job: JobModelDTO = await response.raw.json();
  return job;
}

function isZipFileEntry(
  entry: ZipEntry | ZipFileEntry<any, any>
): entry is ZipFileEntry<any, any> {
  return !("directory" in entry);
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
function rewriteConfig(config_body: string) {
  const table = parse(config_body, { bigint: false });
  table.run_dir = JOB_OUTPUT_DIR;
  table.mode = "local";
  table.postprocess = true;
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
  const zip_fs = new fs.FS();
  await zip_fs.importBlob(upload);
  const config = zip_fs.getChildByName(WORKFLOW_CONFIG_FILENAME);
  if (config === undefined) {
    throw new Error(`Unable to find ${WORKFLOW_CONFIG_FILENAME} in archive`);
  }
  if (!isZipFileEntry(config)) {
    throw new Error(`${WORKFLOW_CONFIG_FILENAME} in archive is not a file`);
  }
  const config_body = await config.getText();

  // TODO validate config using catalog and ajv

  const new_config = rewriteConfig(config_body);

  config.rename(`${WORKFLOW_CONFIG_FILENAME}.orig`);
  zip_fs.addText(WORKFLOW_CONFIG_FILENAME, new_config);
  return await zip_fs.exportBlob();
}
