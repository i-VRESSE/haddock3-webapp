import type { Params } from "@remix-run/react";
import { createClient } from "./config.server";
import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "../bartender-client/constants";
import type { DirectoryItem } from "~/bartender-client/types";

const BOOK_KEEPING_FILES = [
  "stderr.txt",
  "stdout.txt",
  "returncode",
  "workflow.cfg.orig",
];

export function jobIdFromParams(params: Params) {
  const jobId = params.id;
  if (jobId == null) {
    throw new Error("job id not given");
  }
  return parseInt(jobId);
}

export async function getJobs(bartenderToken: string, limit = 100, offset = 0) {
  const client = createClient(bartenderToken);
  const { data, error } = await client.GET("/api/job/", {
    params: {
      query: {
        limit,
        offset,
      },
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function getJobById(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { data, error } = await client.GET("/api/job/{jobid}", {
    params: {
      path: {
        jobid,
      },
    },
  });
  if (error) {
    throw error;
  }
  return data;
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
  bartenderToken: string
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
  maxDepth = 1
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
    }
  );
  if (error) {
    throw error;
  }
  return data;
}

export async function listOutputFiles(
  jobid: number,
  bartenderToken: string,
  maxDepth = 3
) {
  return listFilesAt(jobid, JOB_OUTPUT_DIR, bartenderToken, maxDepth);
}

export async function listInputFiles(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { data, error } = await client.GET("/api/job/{jobid}/directories", {
    params: {
      path: {
        jobid,
      },
      query: {
        max_depth: 3,
      },
    },
  });
  if (error) {
    throw error;
  }
  const nonInputFiles = new Set([...BOOK_KEEPING_FILES, JOB_OUTPUT_DIR]);
  // TODO instead of filtering here add exclude parameter to bartender endpoint.
  data.children = data.children?.filter((c) => !nonInputFiles.has(c.name));
  return data;
}

export async function getArchive(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/archive", {
    params: {
      path: {
        jobid,
      },
      query: {
        archive_format: ".zip",
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getInputArchive(jobid: number, bartenderToken: string) {
  const client = createClient(bartenderToken);
  const { response } = await client.GET("/api/job/{jobid}/archive", {
    params: {
      path: {
        jobid,
      },
      query: {
        archive_format: ".zip",
        exclude: BOOK_KEEPING_FILES,
        exclude_dirs: [JOB_OUTPUT_DIR],
      },
    },
    parseAs: "stream",
  });
  return response;
}

export async function getOutputArchive(jobid: number, bartenderToken: string) {
  return await getSubDirectoryAsArchive(jobid, JOB_OUTPUT_DIR, bartenderToken);
}

export async function getSubDirectoryAsArchive(
  jobid: number,
  path: string,
  bartenderToken: string
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
    (c) => c.is_dir && c.name.includes("_")
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
  bartenderToken: string
) {
  const client = createClient(bartenderToken);
  const { error } = await client.POST("/api/job/{jobid}/name", {
    params: {
      path: {
        jobid,
      },
    },
    body: name,
  });
  if (error) {
    throw error;
  }
}

export async function jobHasWorkflow(jobid: number, bartenderToken: string) {
  const response = await getJobfile(
    jobid,
    WORKFLOW_CONFIG_FILENAME,
    bartenderToken
  );
  return response.status === 200;
}
