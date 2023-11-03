import type { Output } from "valibot";
import { object, number, coerce, finite, parse } from "valibot";
import {
  buildPath,
  getJobfile,
  listOutputFiles,
  safeApi,
  getModuleIndexPadding,
} from "~/models/job.server";
import { interactivenessOfModule, getLastCaprievalModule } from "./shared";
import { JOB_OUTPUT_DIR } from "~/models/constants";

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

export async function getWeights(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
): Promise<Weights> {
  const path = buildPath({
    moduleIndex: module,
    moduleName: "caprieval",
    interactivness,
    suffix: "weights_params.json",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.json();
  return parse(WeightsSchema, body);
}

export async function step2rescoreModule(
  jobid: number,
  bartenderToken: string,
  moduleIndex: number = -1
): Promise<[number, number, number]> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  if (moduleIndex === -1) {
    moduleIndex = getLastCaprievalModule(files);
  }
  const pad = getModuleIndexPadding(files);
  const interactivness = interactivenessOfModule(moduleIndex, files);
  return [moduleIndex, interactivness, pad];
}

export async function getScores(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  moduleIndexPadding: number,
  moduleName = "caprieval"
) {
  const prefix = buildPath({
    moduleIndex: module,
    moduleName,
    interactivness,
    moduleIndexPadding,
  });
  const structures = await getStructureScores(prefix, jobid, bartenderToken);
  const clusters = await getClusterScores(prefix, jobid, bartenderToken);
  return { structures, clusters };
}

export interface CaprievalStructureRow {
  model: string;
  md5: number | "-";
  caprieval_rank: number;
  score: number;
  irmsd: number;
  fnat: number;
  lrmsd: number;
  ilrmsd: number;
  dockq: number;
  "cluster-id": number | "-";
  "cluster-ranking": number | "-";
  "model-cluster-ranking": number | "-";
  air: number;
  angles: number;
  bonds: number;
  bsa: number;
  cdih: number;
  coup: number;
  dani: number;
  desolv: number;
  dihe: number;
  elec: number;
  improper: number;
  rdcs: number;
  rgtotal: number;
  vdw: number;
  vean: number;
  xpcs: number;
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
  const data = tsvParse(body, autoType) as any as CaprievalStructureRow[];
  return await correctPaths(data, jobid, bartenderToken);
}

function isString(x: any): string {
  if (typeof x === "string") {
    return x;
  }
  throw new Error("Expected string");
}

async function correctPaths(
  data: CaprievalStructureRow[],
  jobid: number,
  bartenderToken: string
) {
  const path = isString(data[0].model).replace("..", JOB_OUTPUT_DIR);
  try {
    await getJobfile(jobid, path, bartenderToken);
    return data;
  } catch (e) {
    // When the model is not found, it is probably gzipped
    for (const row of data) {
      row.model = `${row.model}.gz`;
    }
    return data;
  }
}

export interface CaprievalClusterRow {
  cluster_rank: number | "-";
  cluster_id: number | "-";
  n: number;
  under_eval: number | "-";
  score: number;
  score_std: number;
  irmsd: number;
  irmsd_std: number;
  fnat: number;
  fnat_std: number;
  lrmsd: number;
  lrmsd_std: number;
  dockq: number;
  dockq_std: number;
  air: number;
  air_std: number;
  bsa: number;
  bsa_std: number;
  desolv: number;
  desolv_std: number;
  elec: number;
  elec_std: number;
  total: number;
  total_std: number;
  vdw: number;
  vdw_std: number;
  caprieval_rank: number;
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
  return tsvParse(commentless, autoType) as any as Promise<
    CaprievalClusterRow[]
  >;
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
