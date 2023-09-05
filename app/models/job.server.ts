import type { Params } from "@remix-run/react";
import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { JOB_OUTPUT_DIR } from "./constants";
import { ResponseError } from "~/bartender-client";
import { object, number, Output } from "valibot";

const BOOK_KEEPING_FILES = [
  "stderr.txt",
  "stdout.txt",
  "meta",
  "returncode",
  "workflow.cfg.orig",
];

function buildJobApi(bartenderToken: string) {
  return new JobApi(buildConfig(bartenderToken));
}

export function jobIdFromParams(params: Params) {
  const jobId = params.id;
  if (jobId == null) {
    throw new Error("job id not given");
  }
  return parseInt(jobId);
}

export async function getJobs(bartenderToken: string, limit = 10, offset = 0) {
  const api = buildJobApi(bartenderToken);
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
  bartenderToken: string,
  fn: (api: JobApi) => Promise<R>
): Promise<R> {
  const api = buildJobApi(bartenderToken);
  try {
    return await fn(api);
  } catch (error) {
    handleApiError(error);
  }
}

export async function getJobById(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, (api) => api.retrieveJob({ jobid }));
}

export async function getJobStdout(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobStdoutRaw({ jobid });
    return response.raw;
  });
}

export async function getJobStderr(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobStderrRaw({ jobid });
    return response.raw;
  });
}

export async function getJobfile(
  jobid: number,
  path: string,
  bartenderToken: string
) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobFilesRaw({ jobid, path });
    return response.raw;
  });
}

export async function listOutputFiles(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
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

export async function listInputFiles(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
    const items = await api.retrieveJobDirectories({
      jobid,
      maxDepth: 3,
    });
    const nonInputFiles = new Set([...BOOK_KEEPING_FILES, JOB_OUTPUT_DIR]);
    // TODO instead of filtering here add exclude parameter to bartender endpoint.
    items.children = items.children?.filter((c) => !nonInputFiles.has(c.name));
    return items;
  });
}

export async function getArchive(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}

export async function getInputArchive(jobid: number, bartenderToken: string) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobDirectoryAsArchiveRaw({
      jobid,
      exclude: BOOK_KEEPING_FILES,
      excludeDirs: [JOB_OUTPUT_DIR],
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}

export async function getOutputArchive(jobid: number, bartenderToken: string) {
  return await getSubDirectoryAsArchive(jobid, JOB_OUTPUT_DIR, bartenderToken);
}

export async function getSubDirectoryAsArchive(
  jobid: number,
  path: string,
  bartenderToken: string
) {
  return await safeApi(bartenderToken, async (api) => {
    const response = await api.retrieveJobSubdirectoryAsArchiveRaw({
      jobid,
      path,
      archiveFormat: ".zip",
    });
    return response.raw;
  });
}

export const WeightsSchema = object(
  {
    w_elec: number(),
    w_vdw: number(),
    w_desolv: number(),
    w_bsa: number(),
    w_air: number(),
  }
);
export type Weights = Output<typeof WeightsSchema>;

async function getConfig(jobid: number, bartenderToken: string) {
  const path =  'output/data/configurations/enhanced_haddock_params.json'
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.json()
  return body
}

export function getWeightsFromConfig(config: any): Weights {
  // Find last module with weights
  const keys = Object.keys(config).reverse()
  for (const key of keys) {
    const module = config[key]
    if ('w_elec' in module) {
      return {
        w_elec: module.w_elec,
        w_vdw: module.w_vdw,
        w_desolv: module.w_desolv,
        w_bsa: module.w_bsa,
        w_air: module.w_air,
      }
    } 
  }
  throw new Error('No weights found in config')
}

export async function getWeights(jobid: number, bartenderToken: string): Promise<Weights> {
  // TODO check if rescore has been run and return those weights
  const config = await getConfig(jobid, bartenderToken)
  return getWeightsFromConfig(config)
}

export async function step2rescoreModule(jobid: number, bartenderToken: string): Promise<number> {
  return -1
}

export async function getScores(jobid: number, module: number, bartenderToken: string) {
  const files = await listOutputFiles(jobid, bartenderToken);
  
}

export async function rescore(jobid: number, module: number, weights: Weights, bartenderToken: string) {
  const body = {
    module,
    ...weights
  }
  const result = await safeApi(bartenderToken, async (api) => {
    const response = await api.runInteractiveApp({
      jobid,
      application: "rescore",
      body,
    });
    return response;
  });
  if (result.returncode !== 0) {
    throw new Error(`rescore failed with return code ${result.returncode}`);
  }
  return await getScores(jobid, module, bartenderToken);
}