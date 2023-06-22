import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { JOB_OUTPUT_DIR } from "./constants";

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

export async function getJobById(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  return await api.retrieveJob({
    jobid,
  });
}

export async function getJobStdout(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const response = await api.retrieveJobStdoutRaw({
    jobid,
  });
  return response.raw;
}

export async function getJobStderr(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const response = await api.retrieveJobStderrRaw({
    jobid,
  });
  return response.raw;
}

export async function getJobfile(
  jobid: number,
  path: string,
  accessToken: string
) {
  const api = buildJobApi(accessToken);
  const response = await api.retrieveJobFilesRaw({
    jobid,
    path,
  });
  return response.raw;
}

export async function listOutputFiles(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const items = await api.retrieveJobDirectoriesFromPath({
    jobid,
    path: JOB_OUTPUT_DIR,
    maxDepth: 3,
  });
  return items;
}

export async function getInputArchive(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const exclude = ['stderr.txt', 'stdout.txt', 'meta', 'returncode']
  const excludeDirs = [JOB_OUTPUT_DIR];
  const response = await api.retrieveJobDirectoryAsArchiveRaw({
    jobid,
    exclude,
    excludeDirs
  })
  return response.raw;
}

export async function getOutputArchive(jobid: number, accessToken: string) {
  const api = buildJobApi(accessToken);
  const response = await api.retrieveJobSubdirectoryAsArchiveRaw({
    jobid,
    path: JOB_OUTPUT_DIR,
  })
  return response.raw;
}