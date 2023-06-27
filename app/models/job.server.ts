import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { BOOKKEEPINGFILES, JOB_OUTPUT_DIR } from "./constants";
import { ResponseError } from "~/bartender-client";

function buildJobApi(accessToken: string = "") {
  return new JobApi(buildConfig(accessToken));
}

export async function getJobs(accessToken: string, limit = 10, offset = 0) {
  const api = buildJobApi(accessToken);
  return await api.retrieveJobs({
    limit,
    offset,
  });
}

function handleApiError(error: unknown): never {
  if (error instanceof ResponseError) {
    throw new Response(null, {
      status: error.response.status,
      statusText: error.response.statusText,
    });
  }
  throw error;
}

async function safeApi<R>(
  accessToken: string,
  fn: (api: JobApi) => Promise<R>
): Promise<R> {
  const api = buildJobApi(accessToken);
  try {
    return await fn(api);
  } catch (error) {
    handleApiError(error);
  }
}

export async function getJobById(jobid: number, accessToken: string) {
  return await safeApi(accessToken, (api) => api.retrieveJob({ jobid }));
}

export async function getJobStdout(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobStdoutRaw({ jobid });
    return response.raw;
  });
}

export async function getJobStderr(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobStderrRaw({ jobid });
    return response.raw;
  });
}

export async function getJobfile(
  jobid: number,
  path: string,
  accessToken: string
) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobFilesRaw({ jobid, path });
    return response.raw;
  });
}

export async function listOutputFiles(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const items = await api.retrieveJobDirectoriesFromPath({
      jobid,
      path: JOB_OUTPUT_DIR,
      // user might have supplied deeper directory structure
      // so can not browse past maxDepth,
      // but can download archive with files at any depth
      maxDepth: 3,
    });
    return items;
  });
}

export async function listInputFiles(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const items = await api.retrieveJobDirectories({
      jobid,
      maxDepth: 3,
    });
    const nonInputFiles = new Set([...BOOKKEEPINGFILES, JOB_OUTPUT_DIR]);
    // TODO instead of filtering here add exclude parameter to bartender endpoint.
    items.children = items.children?.filter((c) => !nonInputFiles.has(c.name));
    return items;
  });
}

export async function getArchive(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}

export async function getInputArchive(jobid: number, accessToken: string) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      exclude: BOOKKEEPINGFILES,
      excludeDirs: [JOB_OUTPUT_DIR],
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}

export async function getOutputArchive(jobid: number, accessToken: string) {
  return await getSubDirectoryAsArchive(jobid, JOB_OUTPUT_DIR, accessToken);
}

export async function getSubDirectoryAsArchive(
  jobid: number,
  path: string,
  accessToken: string
) {
  return await safeApi(accessToken, async (api) => {
    const response = await api.retrieveJobSubdirectoryAsArchiveRaw({
      jobid,
      path,
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}
