import type { Output } from "valibot";
import { object, coerce, number, finite, string, useDefault } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";

import { buildPath, getJobfile, safeApi } from "~/models/job.server";
import { parseClusterTsv } from "./shared";

export const Schema = object({
  // TODO newer valibot has picklist to constrain values, but gives tsc error, wait for next version
  criterion: string(),
  n_clusters: useDefault(coerce(number([finite()]), Number), -1),
  clust_cutoff: useDefault(coerce(number([finite()]), Number), -1),
  min_population: coerce(number([finite()]), Number),
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
  const params = {
    // TODO haddock3-re clustrmsd CLI accepts n_clusters while module only has n_clusters_cutoff
    // use n_clusters_cutoff in CLI
    criterion: config.criterion,
    min_population: config.min_population,
    n_clusters: -1,
    clust_cutoff: -1,
  };
  if (config.criterion === "maxclust") {
    params.n_clusters = config.n_clusters;
  } else {
    params.clust_cutoff = config.clust_cutoff;
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
  // TODO need bartender to handle optional arguments
  // https://github.com/haddocking/haddock3/blob/7e3cbbd60df5f72ce09a7f7a47f7eb9c18ddfca5/src/haddock/re/clustrmsd.py#L99-L109
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
