import { buildPath, getJobfile, safeApi } from "~/models/job.server";
import { parseClusterTsv } from "./shared";
import { object, number, coerce, finite, type Output } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";

export const Schema = object({
  fraction: coerce(number([finite()]), Number),
  strictness: coerce(number([finite()]), Number),
  threshold: coerce(number([finite()]), Number),
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
    moduleName: "clustfcc",
    interactivness,
    suffix: "params.cfg",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config: any = parseTOML(body, { bigint: false });
  /*
    In params.cfg:
    threshold = 1
    strictness = 0.75
    fraction = 0.3
    */
  if (!interactivness) {
    // non-interactive has `[clustfcc]` section
    config = config.clustfcc;
  }
  const params = {
    // haddock3-re clustfcc CLI accepts fraction while module only has fraction_cutoff
    // use fraction_cutoff in CLI
    // TODO check that we are using right value?
    fraction: interactivness ? config.fraction : config.fraction_cutoff,
    strictness: config.strictness,
    threshold: config.threshold,
  };
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
    moduleName: "clustfcc",
    interactivness,
    suffix: "clustfcc.tsv",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const rows = await parseClusterTsv(body);
  return rows;
}

export async function reclustfcc(
  jobid: number,
  clustfccDir: string,
  params: Schema,
  bartenderToken: string
) {
  const body = {
    clustfcc_dir: clustfccDir,
    ...params,
  };
  const result = await safeApi(bartenderToken, async (api) => {
    const response = await api.runInteractiveApp({
      jobid,
      application: "reclustfcc",
      body,
    });
    return response;
  });
  if (result.returncode !== 0) {
    console.error(result);
    throw new Error(`reclustfcc failed with return code ${result.returncode}`);
  }
}
