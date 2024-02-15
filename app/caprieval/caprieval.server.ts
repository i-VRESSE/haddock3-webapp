import type { Output } from "valibot";
import { object, number, coerce, finite, parse, picklist } from "valibot";
import {
  buildPath,
  getJobfile,
  listOutputFiles,
  getModuleIndexPadding,
  buildAnalyisPath,
} from "~/models/job.server";
import type { PlotlyProps } from "~/components/PlotlyPlot";
import type { DirectoryItem } from "~/bartender-client/types";
import { parseTsv } from "../models/tsv";
import { hasInteractiveVersion } from "../models/module_utils";
import {
  CAPRIEVAL_SCATTERPLOT_CHOICES,
  CAPRIEVAL_BOXPLOT_CHOICES,
} from "./constants";

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

export async function getWeights({
  jobid,
  module,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  module: number;
  isInteractive?: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
}): Promise<Weights> {
  const path = buildPath({
    moduleIndex: module,
    moduleName: "caprieval",
    isInteractive,
    suffix: "weights_params.json",
    moduleIndexPadding: moduleIndexPadding,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.json();
  return parse(WeightsSchema, body);
}

export async function getCaprievalModuleInfo(
  jobid: number,
  bartenderToken: string,
  moduleIndex: number = -1
): Promise<[number, boolean, number]> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  if (moduleIndex === -1) {
    moduleIndex = getLastCaprievalModule(files)[0];
  }
  const pad = getModuleIndexPadding(files);
  const interactivness = hasInteractiveVersion(moduleIndex, files);
  return [moduleIndex, interactivness, pad];
}

export async function getScores({
  jobid,
  module,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
  moduleName = "caprieval",
}: {
  jobid: number;
  module: number;
  isInteractive?: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
  moduleName?: string;
}) {
  const prefix = buildPath({
    moduleIndex: module,
    moduleName,
    isInteractive,
    moduleIndexPadding,
  });
  const structures = await getStructureScores(prefix, jobid, bartenderToken);
  const clusters = await getClusterScores(prefix, jobid, bartenderToken);
  return { structures, clusters };
}

export interface CaprievalPlotlyProps {
  scatters: PlotlyProps;
  boxes: PlotlyProps;
}

export function getPlotSelection(url: string) {
  const params = new URL(url).searchParams;
  const scatterSelection = params.get("ss") || "report";
  const boxSelection = params.get("bs") || "report";
  const ScatterSchema = picklist(
    Object.keys(CAPRIEVAL_SCATTERPLOT_CHOICES) as [string, ...string[]]
  );
  const BoxSchema = picklist(
    Object.keys(CAPRIEVAL_BOXPLOT_CHOICES) as [string, ...string[]]
  );
  // TODO present nice error message
  return {
    scatterSelection: parse(ScatterSchema, scatterSelection),
    boxSelection: parse(BoxSchema, boxSelection),
  };
}

export async function getCaprievalPlots({
  jobid,
  module,
  bartenderToken,
  moduleIndexPadding,
  scatterSelection,
  boxSelection,
  isInteractive = false,
  moduleName = "caprieval",
}: {
  jobid: number;
  module: number;
  isInteractive?: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
  scatterSelection: string;
  boxSelection: string;
  moduleName?: string;
}): Promise<CaprievalPlotlyProps> {
  const shtml = await fetchHtml(
    jobid,
    module,
    isInteractive,
    bartenderToken,
    moduleIndexPadding,
    moduleName,
    `${scatterSelection}.html`
  );
  const scatters = getPlotFromHtml(shtml, 1);
  let bhtml: string;
  if (scatterSelection === "report" && boxSelection === "report") {
    // if both are report, we can reuse the html
    bhtml = shtml;
  } else {
    bhtml = await fetchHtml(
      jobid,
      module,
      isInteractive,
      bartenderToken,
      moduleIndexPadding,
      moduleName,
      `${boxSelection}.html`
    );
  }
  // plot id is always 1 for non-report plot as html file contains just one plot
  const bplotId = boxSelection === "report" ? 2 : 1;
  const boxes = getPlotFromHtml(bhtml, bplotId);
  return { scatters, boxes };
}

async function fetchHtml(
  jobid: number,
  module: number,
  isInteractive: boolean,
  bartenderToken: string,
  moduleIndexPadding: number,
  moduleName = "caprieval",
  htmlFilename = "report.html"
) {
  const prefix = buildAnalyisPath({
    moduleIndex: module,
    moduleName,
    isInteractive,
    moduleIndexPadding,
  });
  const response = await getJobfile(
    jobid,
    `${prefix}${htmlFilename}`,
    bartenderToken
  );
  if (!response.ok) {
    throw new Error(`could not get ${htmlFilename}`);
  }
  return await response.text();
}

export function getPlotFromHtml(html: string, plotId = 1) {
  // this is very fragile, but much faster then using a HTML parser
  // as order of attributes is not guaranteed
  // see commit meessage of this line for benchmark
  const re = new RegExp(
    `<script id="data${plotId}" type="application\\/json">([\\s\\S]*?)<\\/script>`
  );
  const a = html.match(re);
  const dataAsString = a![1].trim();
  return JSON.parse(dataAsString) as PlotlyProps;
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
  rg: number;
  sym: number;
  total: number;
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
  return parseTsv<CaprievalStructureRow>(body);
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
  ilrmsd?: number;
  ilrmsd_std?: number;
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
  return parseTsv<CaprievalClusterRow>(body, true);
}

export function getLastCaprievalModule(files: DirectoryItem): [number, number] {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const module of modules || []) {
    if (
      module.is_dir &&
      module.name.endsWith("caprieval") &&
      !module.name.includes("_interactive")
    ) {
      const index = parseInt(module.name.split("_")[0]);
      const moduleIndexPadding = getModuleIndexPadding(files);
      return [index, moduleIndexPadding];
    }
  }
  throw new Error("No caprieval module found");
}

export function buildBestRankedPath(
  module: number,
  moduleIndexPadding: number
) {
  // output/analysis/12_caprieval_analysis/summary.tgz
  return buildAnalyisPath({
    moduleIndex: module,
    moduleName: "caprieval",
    moduleIndexPadding,
    suffix: "summary.tgz",
  });
}
