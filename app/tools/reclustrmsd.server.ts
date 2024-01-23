import type { Output } from "valibot";
import {
  object,
  coerce,
  number,
  optional,
  picklist,
  integer,
  parse,
} from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";

import { buildPath, getJobfile } from "~/models/job.server";
import { getClusterTsv } from "./recluster.server";
import { createClient } from "~/models/config.server";

export const Schema = object({
  // TODO newer valibot has picklist to constrain values, but gives tsc error, wait for next version
  criterion: optional(picklist(["maxclust", "distance"]), "maxclust"),
  n_clusters: optional(coerce(number([integer()]), Number)),
  clust_cutoff: optional(coerce(number(), Number)),
  min_population: optional(coerce(number([integer()]), Number)),
});
export type Schema = Output<typeof Schema>;

export async function getParams({
  jobid,
  moduleIndex,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}): Promise<Schema> {
  const path = buildPath({
    moduleIndex,
    isInteractive,
    moduleIndexPadding,
    moduleName: "clustrmsd",
    suffix: "params.cfg",
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config = parseTOML(body, { bigint: false });
  if (!isInteractive) {
    // non-interactive has `[clustrmsd]` section
    config = config.clustrmsd as typeof config;
  }
  const params = parse(Schema, config);
  return params;
}

export async function getClusters(options: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}) {
  return getClusterTsv({
    ...options,
    moduleName: "clustrmsd",
    filename: "clustrmsd.tsv",
  });
}

export async function reclustrmsd({
  jobid,
  moduleIndex,
  clustrmsdDir,
  params,
  bartenderToken,
}: {
  jobid: number;
  moduleIndex: number;
  clustrmsdDir: string;
  params: Schema;
  bartenderToken: string;
}) {
  const body = {
    clustrmsd_dir: clustrmsdDir,
    module_nr: moduleIndex,
    ...params,
  };

  const client = createClient(bartenderToken);
  const { data, error } = await client.POST(
    "/api/job/{jobid}/interactive/reclustrmsd",
    {
      params: {
        path: {
          jobid,
        },
      },
      body,
    }
  );
  if (error) {
    throw error;
  }
  if (data.returncode !== 0) {
    console.error(data);
    throw new Error(`reclustfcc failed with return code ${data.returncode}`);
  }
}
