import type { Params } from "@remix-run/react";
import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { JOB_OUTPUT_DIR } from "./constants";
import type { DirectoryItem } from "~/bartender-client";
import { ResponseError } from "~/bartender-client";
import type { Output } from "valibot";
import { object, number, coerce, finite } from "valibot";

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

export async function listOutputFiles(
  jobid: number,
  bartenderToken: string,
  maxDepth = 3
) {
  return await safeApi(bartenderToken, async (api) => {
    const items = await api.retrieveJobDirectoriesFromPath({
      jobid,
      path: JOB_OUTPUT_DIR,
      // user might have supplied deeper directory structure
      // so can not browse past maxDepth,
      // but can download archive with files at any depth
      maxDepth,
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

export const WeightsSchema = object({
  // could use minimum/maximum from catalog,
  // if they had sane values instead of -9999/9999
  w_elec: coerce(number([finite()]), Number),
  w_vdw: coerce(number([finite()]), Number),
  w_desolv: coerce(number([finite()]), Number),
  w_bsa: coerce(number([finite()]), Number),
  w_air: coerce(number([finite()]), Number),
});
export type Weights = Output<typeof WeightsSchema>;

async function getConfig(jobid: number, bartenderToken: string) {
  const path = "output/data/configurations/enhanced_haddock_params.json";
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  return JSON.parse(body.replace(/\bNaN\b/g, "null"));
}

export function getWeightsFromConfig(config: any): Weights {
  // Find last module with weights
  const keys = Object.keys(config).reverse();
  for (const key of keys) {
    const module = config[key];
    if ("w_elec" in module) {
      return {
        w_elec: module.w_elec,
        w_vdw: module.w_vdw,
        w_desolv: module.w_desolv,
        w_bsa: module.w_bsa,
        w_air: module.w_air,
      };
    }
  }
  throw new Error("No weights found in config");
}

export async function getWeights(
  jobid: number,
  bartenderToken: string
): Promise<Weights> {
  // TODO check if rescore has been run and return those weights
  const config = await getConfig(jobid, bartenderToken);
  return getWeightsFromConfig(config);
}

export function getLastCaprievalModule(files: DirectoryItem): number {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const module of modules || []) {
    if (module.isDir && module.name.endsWith("caprieval")) {
      return parseInt(module.name.split("_")[0]);
    }
  }
  throw new Error("No caprieval module found");
}

export async function step2rescoreModule(
  jobid: number,
  bartenderToken: string
): Promise<number> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  return getLastCaprievalModule(files);
}

export async function getScores(
  jobid: number,
  module: number,
  bartenderToken: string,
  interactivness = 0
) {
  // output/15_caprieval/capri_ss.tsv
  let prefix = `output/${module}_caprieval`;
  if (interactivness > 0) {
    Array(interactivness).forEach(() => (prefix += "_interactive"));
  }
  const structures = await getStructureScores(prefix, jobid, bartenderToken);
  const clusters = await getClusterScores(prefix, jobid, bartenderToken);
  return { structures, clusters };
}

async function getStructureScores(
  prefix: string,
  jobid: number,
  bartenderToken: string
) {
  const path = `${prefix}/capri_ss.tsv`;
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const { tsvParse } = await import("d3-dsv");
  return tsvParse(body);
}

async function getClusterScores(
  prefix: string,
  jobid: number,
  bartenderToken: string
) {
  const path = `${prefix}/capri_clt.tsv`;
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const { tsvParse } = await import("d3-dsv");
  const commentless = removeComments(body);
  return tsvParse(commentless);
}

function removeComments(body: string): string {
  return body.replace(/^#.*\n/gm, "");
}

export async function getInteractiveScores(
  jobid: number,
  module: number,
  bartenderToken: string
) {
  // Calling rescore multiple times will keep adding `_interactive` to the module name.
  // TODO find the last one or somehow return all of them together with their weights
  return await getScores(jobid, module, bartenderToken, 1);
}

export async function rescore(
  jobid: number,
  module: number,
  weights: Weights,
  bartenderToken: string
) {
  const body = {
    module,
    ...weights,
  };
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
  // TODO used weights are outputed to result.stdout, need some way to store them
  // either using https://github.com/i-VRESSE/bartender/pull/76
  // or as part of https://github.com/haddocking/haddock3/tree/interactive_rescoring
}
