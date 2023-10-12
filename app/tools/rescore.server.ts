import type { DirectoryItem } from "~/bartender-client";
import type { Output } from "valibot";
import { object, number, coerce, finite, parse } from "valibot";
import {
  buildPath,
  getJobfile,
  getEnhancedConfig,
  listOutputFiles,
  safeApi,
  getModuleIndexPadding,
} from "~/models/job.server";
import { interactivenessOfModule } from "./shared";

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

export function getWeightsFromConfig(config: any): Weights {
  // TODO instead of latest use module index
  // but what on disk is called 15_caprieval
  // in config is called caprieval.6
  // with global config on same level as modules
  // so hard to determine which module is which index

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

export async function getInteractiveWeights(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  moduleIndexPadding: number
): Promise<Weights> {
  const path = buildPath({
    moduleIndex: module,
    moduleName: "caprieval",
    interactivness,
    suffix: "weights_params.json",
    moduleIndexPadding,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.json();
  return parse(WeightsSchema, body);
}

export async function getWeights(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
): Promise<Weights> {
  if (interactivness > 0) {
    return await getInteractiveWeights(
      jobid,
      module,
      interactivness,
      bartenderToken,
      pad
    );
  }
  const config = await getEnhancedConfig(jobid, bartenderToken);
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
): Promise<[number, number, number]> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  const moduleIndex = getLastCaprievalModule(files);
  const pad = getModuleIndexPadding(files);
  const interactivness = interactivenessOfModule(moduleIndex, files);
  return [moduleIndex, interactivness, pad];
}

export type DSVRow = Record<string, string | number>;

export async function getScores(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  moduleIndexPadding: number
) {
  const prefix = buildPath({
    moduleIndex: module,
    moduleName: "caprieval",
    interactivness,
    moduleIndexPadding,
  });
  const structures = await getStructureScores(prefix, jobid, bartenderToken);
  const clusters = await getClusterScores(prefix, jobid, bartenderToken);
  return { structures, clusters };
}

async function getStructureScores(
  prefix: string,
  jobid: number,
  bartenderToken: string
) {
  const path = `${prefix}capri_ss.tsv`;
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const { tsvParse, autoType } = await import("d3-dsv");
  // TODO we know what rows capri_ss.tsv has, so we could use a more specific type
  const data = tsvParse(body, autoType) as any as DSVRow[];  
  return await correctPaths(data, jobid, bartenderToken)
}

function isString(x: any): string {
  if (typeof x === 'string') {
    return x
  }
  throw new Error('Expected string')
}

async function correctPaths(data: DSVRow[], jobid: number, bartenderToken: string) {
  const path = isString(data[0].model)
  const response = await getJobfile(jobid, path, bartenderToken);
  if (response.status === 404) {
    for (const row of data) {
      row.model = `${row.model}.gz`
    }
  }
  return data
}

async function getClusterScores(
  prefix: string,
  jobid: number,
  bartenderToken: string
) {
  const path = `${prefix}capri_clt.tsv`;
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const { tsvParse, autoType } = await import("d3-dsv");
  const commentless = removeComments(body);
  // TODO we know what rows capri_clt.tsv has, so we could use a more specific type
  return tsvParse(commentless, autoType) as any as Promise<DSVRow[]>;
}

function removeComments(body: string): string {
  return body.replace(/^#.*\n/gm, "");
}

export async function rescore(
  jobid: number,
  capriFir: string,
  weights: Weights,
  bartenderToken: string
) {
  const body = {
    capri_dir: capriFir,
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
    console.error(result);
    throw new Error(`rescore failed with return code ${result.returncode}`);
  }
}
