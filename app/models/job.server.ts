import type { Params } from "@remix-run/react";
import { JobApi } from "~/bartender-client/apis/JobApi";
import { buildConfig } from "./config.server";
import { JOB_OUTPUT_DIR } from "./constants";
import type { DirectoryItem } from "~/bartender-client";
import { ResponseError } from "~/bartender-client";

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

export async function safeApi<R>(
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

export function getModuleIndexPadding(files: DirectoryItem) {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const nrModules = files.children.filter(
    (c) => c.isDir && c.name.includes("_")
  ).length;
  return Math.floor(Math.log10(nrModules));
}

export function buildPath({
  prefix = "output",
  moduleIndex,
  moduleName,
  interactivness = 0,
  suffix = "",
  moduleIndexPadding,
}: {
  prefix?: string;
  moduleIndex: number;
  moduleName: string;
  interactivness?: number;
  suffix?: string;
  moduleIndexPadding: number;
}) {
  const interactive_suffix = Array(interactivness + 1).join("_interactive");
  const moduleIndexPadded = moduleIndex
    .toString()
    .padStart(moduleIndexPadding, "0");
  return `${prefix}/${moduleIndexPadded}_${moduleName}${interactive_suffix}/${suffix}`;
}

export async function getEnhancedConfig(jobid: number, bartenderToken: string) {
  const path = "output/data/configurations/enhanced_haddock_params.json";
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  // File was generated with Python which had allow_nan=True
  // JS does not allow NaN in JSON
  // so replace NaN with null
  return JSON.parse(body.replace(/\bNaN\b/g, "null"));
}

export async function isOutputCleaned(
  jobid: number,
  bartenderToken: string
): Promise<boolean> {
  const files = await listOutputFiles(jobid, bartenderToken);
  const compressedExtensions = [
    '.inp',
    '.out',
    '.pdb',
    '.psf',
    ]
  for (const item of files.children ?? []) {
    if (item.isDir && item.name.includes("_")) {
      for (const subitem of item.children ?? []) {
        if (!subitem.isDir && compressedExtensions.some(ext => subitem.name.includes(ext))) {
          return subitem.name.endsWith(".gz");
        }
      }
    }
  }
  return false
}