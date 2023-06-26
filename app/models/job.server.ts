import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { JOB_OUTPUT_DIR } from "./constants";
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

function handleResponseError(error: unknown): never {
  if (error instanceof ResponseError) {
    throw new Response(null, {
      status: error.response.status,
      statusText: error.response.statusText,
    });
  }
  throw error;
}

export async function getJobById(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    return await api.retrieveJob({
      jobid,
    });
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getJobStdout(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    const response = await api.retrieveJobStdoutRaw({
      jobid,
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getJobStderr(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    const response = await api.retrieveJobStderrRaw({
      jobid,
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getJobfile(
  jobid: number,
  path: string,
  accessToken: string
) {
  const api = buildJobApi(accessToken);
  try {
    const response = await api.retrieveJobFilesRaw({
      jobid,
      path,
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function listOutputFiles(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    const items = await api.retrieveJobDirectoriesFromPath({
      jobid,
      path: JOB_OUTPUT_DIR,
      maxDepth: 3,
    });
    return items;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getArchive(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      archiveFormat: ".zip",
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getInputArchive(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const exclude = ["stderr.txt", "stdout.txt", "meta", "returncode"];
  const excludeDirs = [JOB_OUTPUT_DIR];
  try {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      exclude,
      excludeDirs,
      archiveFormat: ".zip",
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}

export async function getOutputArchive(jobid: number, accessToken: string) {
  return await getSubDirectoryAsArchive(
    jobid,
    JOB_OUTPUT_DIR,
    accessToken
  )
}

export async function getSubDirectoryAsArchive(jobid: number, path: string, accessToken: string) {
  const api = buildJobApi(accessToken);
  try {
    const response = await api.retrieveJobSubdirectoryAsArchiveRaw({
      jobid,
      path,
      archiveFormat: ".zip",
    });
    return response.raw;
  } catch (error) {
    handleResponseError(error);
  }
}
