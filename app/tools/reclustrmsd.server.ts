import type { Output } from "valibot";
import { object, coerce, number, optional, picklist } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";

import { buildPath, getJobfile, safeApi } from "~/models/job.server";
import { parseClusterTsv } from "./shared";

export const Schema = object({
  // TODO newer valibot has picklist to constrain values, but gives tsc error, wait for next version
  criterion: optional(picklist(["maxclust", "distance"]), "maxclust"),
  n_clusters: optional(coerce(number(), Number)),
  clust_cutoff: optional(coerce(number(), Number)),
  min_population: optional(coerce(number(), Number)),
});
export type Schema = Output<typeof Schema>;

export async function getParams(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
): Promise<Schema> {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustrmsd",
    interactivness,
    suffix: "params.cfg",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config: any = parseTOML(body, { bigint: false });
  if (!interactivness) {
    // non-interactive has `[clustrmsd]` section
    config = config.clustrmsd;
  }
  // TODO use valibot to get required fields from config
    const params: Schema = {
    criterion: config.criterion,
  };
  if (config.n_clusters !== undefined) {
    params.n_clusters = config.n_clusters;
  }
  if (config.clust_cutoff !== undefined) {
    params.clust_cutoff = config.clust_cutoff;
  }
  if (config.min_population !== undefined) {
    params.min_population = config.min_population;
  }
  return params;
}

export async function getClusters(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
) {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustrmsd",
    interactivness,
    suffix: "clustrmsd.tsv",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const rows = await parseClusterTsv(body);
  return rows;
}

export async function reclustrmsd(
  jobid: number,
  clustfccDir: string,
  params: Schema,
  bartenderToken: string
) {
  const body: any = {
    clustrmsd_dir: clustfccDir,
    ...params,
  };
  console.log("reclustrmsd", body);
  const result = await safeApi(bartenderToken, async (api) => {
    const response = await api.runInteractiveApp({
      jobid,
      application: "reclustrmsd",
      body,
    });
    return response;
  });
  if (result.returncode !== 0) {
    console.error(result);
    throw new Error(`reclustrmsd failed with return code ${result.returncode}`);
  }
}