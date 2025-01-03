import type { Params } from "@remix-run/react";

import { parse as parseTOML } from "@ltd/j-toml";

import { createClient } from "./config.server";
import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "../bartender-client/constants";
import { CompletedJobs, type DirectoryItem } from "~/bartender-client/types";
import { BartenderError } from "./errors";
import { type InferOutput, parse, GenericSchema } from "valibot";

const BOOK_KEEPING_FILES = [
  "stderr.txt",
  "stdout.txt",
  "returncode",
  "workflow.cfg.orig",
];

export const HADDOCK3WEBAPP_REFRESH_RATE_MS = process.env
  .HADDOCK3WEBAPP_REFRESH_RATE_MS
  ? parseInt(process.env.HADDOCK3WEBAPP_REFRESH_RATE_MS)
  : 10000;

export function jobIdFromParams(params: Params) {
  const jobId = params.id;
  if (jobId == null) {
    throw new Error("job id not given");
  }
  return parseInt(jobId);
}

export async function getJobs(bartenderToken: string, limit = 100, offset = 0) {
  const client = createClient(bartenderToken);
  const { data, response } = await client.GET("/api/job/", {
    params: {
      query: {
        limit,
        offset,
      },
    },
  });
  if (!response.ok || !data) {
    throw new Response(response.statusText, { status: response.status });
  }
  return data;
}

export async function getJobById(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { data, response } = await client.GET("/api/job/{jobid}", {
    params: {
      path: {
        jobid,
      },
    },
  });
  if (!response.ok || !data) {
    throw new Response(response.statusText, { status: response.status });
  }
  return data;
}

export async function getCompletedJobById(
  jobid: number,
  bartenderToken: string,
) {
  const job = await getJobById(jobid, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  return job;
}

export async function deleteJob(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { response } = await client.DELETE("/api/job/{jobid}", {
    params: {
      path: {
        jobid,
      },
    },
  });
  if (!response.ok) {
    throw new Response(response.statusText, { status: response.status });
  }
}

export async function getJobStdout(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/stdout", {
    params: {
      path: {
        jobid,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getJobStderr(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/stderr", {
    params: {
      path: {
        jobid,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getJobfile(
  jobid: number,
  path: string,
  bartenderToken: string,
) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/files/{path}", {
    params: {
      path: {
        jobid,
        path,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function listFilesAt(
  jobid: number,
  path: string,
  bartenderToken: string,
  maxDepth = 1,
) {
  const client = createClient(bartenderToken);
  const { data, error } = await client.GET(
    "/api/job/{jobid}/directories/{path}",
    {
      params: {
        path: {
          jobid,
          path,
        },
        query: {
          // user might have supplied deeper directory structure
          // so can not browse past maxDepth,
          // but can download archive with files at any depth
          max_depth: maxDepth,
        },
      },
    },
  );
  if (error) {
    throw new BartenderError(`Unable to list files at ${path}`, {
      cause: error,
    });
  }
  return data;
}

export async function listOutputFiles(
  jobid: number,
  bartenderToken: string,
  maxDepth = 3,
) {
  return listFilesAt(jobid, JOB_OUTPUT_DIR, bartenderToken, maxDepth);
}

export async function listInputFiles(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { data, response } = await client.GET("/api/job/{jobid}/directories", {
    params: {
      path: {
        jobid,
      },
      query: {
        max_depth: 3,
      },
    },
  });
  if (!response.ok || !data) {
    throw new Response(response.statusText, { status: response.status });
  }
  const nonInputFiles = new Set([...BOOK_KEEPING_FILES, JOB_OUTPUT_DIR]);
  // TODO instead of filtering here add exclude parameter to bartender endpoint.
  data.children = data.children?.filter((c) => !nonInputFiles.has(c.name));
  return data;
}

export async function getArchive(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const filename = `haddock3-${jobid}.zip`;
  const { response } = await client.GET("/api/job/{jobid}/archive", {
    params: {
      path: {
        jobid,
      },
      query: {
        archive_format: ".zip",
        filename,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getInputArchive(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const filename = `haddock3-input-${jobid}.zip`;
  const { response } = await client.GET("/api/job/{jobid}/archive", {
    params: {
      path: {
        jobid,
      },
      query: {
        archive_format: ".zip",
        exclude: BOOK_KEEPING_FILES,
        exclude_dirs: [JOB_OUTPUT_DIR],
        filename: filename,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getOutputArchive(jobid: number, bartenderToken: string) {
  const filename = `haddock3-output-${jobid}.zip`;
  return await getSubDirectoryAsArchive(
    jobid,
    JOB_OUTPUT_DIR,
    bartenderToken,
    filename,
  );
}

export async function getSubDirectoryAsArchive(
  jobid: number,
  path: string,
  bartenderToken: string,
  filename: string = "",
) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/archive/{path}", {
    params: {
      path: {
        jobid,
        path,
      },
      query: {
        archive_format: ".zip",
        filename: filename,
      },
    },
    parseAs: "stream",
  });
  return response;
}

export function getModuleIndexPadding(files: DirectoryItem) {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const nrModules = files.children.filter(
    (c) => c.is_dir && c.name.includes("_"),
  ).length;
  return Math.ceil(Math.log10(nrModules));
}

export function buildPath({
  prefix = "output",
  moduleIndex,
  moduleName,
  isInteractive = false,
  suffix = "",
  moduleIndexPadding,
}: {
  prefix?: string;
  moduleIndex: number;
  moduleName: string;
  isInteractive?: boolean;
  suffix?: string;
  moduleIndexPadding: number;
}) {
  const interactiveSuffix = isInteractive ? "_interactive" : "";
  const moduleIndexPadded = moduleIndex
    .toString()
    .padStart(moduleIndexPadding, "0");
  return `${prefix}/${moduleIndexPadded}_${moduleName}${interactiveSuffix}/${suffix}`;
}

// output/analysis/12_caprieval_analysis/report.html
// output/analysis/12_caprieval_interactive_analysis/report.html
// {prefix}/{paddedModuleIndex}_{moduleName}{interactiveSuffix}/{suffix}
export function buildAnalyisPath({
  prefix = "output/analysis",
  moduleIndex,
  moduleName,
  isInteractive = false,
  suffix = "",
  moduleIndexPadding,
}: {
  prefix?: string;
  moduleIndex: number;
  moduleName: string;
  isInteractive?: boolean;
  suffix?: string;
  moduleIndexPadding: number;
}) {
  const interactiveSuffix = isInteractive ? "_interactive" : "";
  const moduleIndexPadded = moduleIndex
    .toString()
    .padStart(moduleIndexPadding, "0");
  return `${prefix}/${moduleIndexPadded}_${moduleName}${interactiveSuffix}_analysis/${suffix}`;
}

export async function updateJobName(
  jobid: number,
  name: string,
  bartenderToken: string,
) {
  const client = createClient(bartenderToken);
  const { response } = await client.POST("/api/job/{jobid}/name", {
    params: {
      path: {
        jobid,
      },
    },
    body: name,
  });
  if (!response.ok) {
    throw new Response(response.statusText, { status: response.status });
  }
}

export async function jobHasWorkflow(jobid: number, bartenderToken: string) {
  const response = await getJobfile(
    jobid,
    WORKFLOW_CONFIG_FILENAME,
    bartenderToken,
  );
  return response.status === 200;
}

/**
 * Fetches the HTML content for a job.
 *
 * @param jobid - The ID of the job.
 * @param module - The module index.
 * @param isInteractive - Indicates whether the interactive version of module should be used.
 * @param bartenderToken - The token for accessing the bartender service.
 * @param moduleIndexPadding - The padding for the module index.
 * @param moduleName - The name of the module (default: "caprieval").
 * @param htmlFilename - The name of the HTML file (default: "report.html").
 * @param isAnalysis - Indicates whether file should be used from analysis/ directory. (default: true).
 * @returns The HTML content of the job.
 * @throws An error if the HTML content could not be fetched.
 */
export async function fetchHtml({
  jobid,
  module,
  isInteractive,
  bartenderToken,
  moduleIndexPadding,
  moduleName = "caprieval",
  htmlFilename = "report.html",
  isAnalysis = true,
}: {
  jobid: number;
  module: number;
  isInteractive: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
  moduleName?: string;
  htmlFilename?: string;
  isAnalysis?: boolean;
}) {
  let prefix = buildAnalyisPath({
    moduleIndex: module,
    moduleName,
    isInteractive,
    moduleIndexPadding,
  });
  if (!isAnalysis) {
    prefix = buildPath({
      moduleIndex: module,
      moduleName,
      isInteractive,
      moduleIndexPadding,
    });
  }
  const response = await getJobfile(
    jobid,
    `${prefix}${htmlFilename}`,
    bartenderToken,
  );
  if (!response.ok) {
    throw new Error(`could not get ${prefix}${htmlFilename}`);
  }
  return await response.text();
}

export async function getParamsCfg<Schema extends GenericSchema>({
  jobid,
  moduleIndex,
  bartenderToken,
  moduleIndexPadding,
  moduleName,
  schema,
  isInteractive = false,
}: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
  moduleName: string;
  schema: Schema;
}): Promise<InferOutput<Schema>> {
  const path = buildPath({
    moduleIndex,
    isInteractive,
    moduleIndexPadding,
    moduleName,
    suffix: "params.cfg",
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config = parseTOML(body, { bigint: false });
  if (!isInteractive) {
    // non-interactive has `[<module name>]` section
    config = config[moduleName] as typeof config;
  }
  const params = parse(schema, config);
  return params;
}
