import type { Output } from "valibot";
import { object, number, coerce, finite, parse, picklist } from "valibot";
import {
  buildPath,
  getJobfile,
  listOutputFiles,
  getModuleIndexPadding,
  buildAnalyisPath,
} from "~/models/job.server";
import { interactivenessOfModule, getLastCaprievalModule } from "./shared";
import {
  CAPRIEVAL_BOXPLOT_CHOICES,
  CAPRIEVAL_SCATTERPLOT_CHOICES,
} from "~/models/constants";
import { createClient } from "~/models/config.server";
import type { PlotlyProps } from "~/components/PlotlyPlot";

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

export async function getCaprievalPlots(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  moduleIndexPadding: number,
  scatterSelection: string,
  boxSelection: string,
  moduleName: string = "caprieval"
): Promise<CaprievalPlotlyProps> {
  console.time('getReportHtml')
  const shtml = await getReportHtml(
    jobid,
    module,
    interactivness,
    bartenderToken,
    moduleIndexPadding,
    moduleName,
    `${scatterSelection}.html`
  );
  console.timeEnd('getReportHtml')
  console.time('getPlotFromHtml scatter')
  const scatters = getPlotFromHtml(shtml, 1);
  let bhtml: string;
  if (scatterSelection === "report" && boxSelection === "report") {
    // if both are report, we can reuse the html
    bhtml = shtml;
  } else {
    bhtml = await getReportHtml(
      jobid,
      module,
      interactivness,
      bartenderToken,
      moduleIndexPadding,
      moduleName,
      `${boxSelection}.html`
    );
  }
  // plot id is always 1 for non-report plot as html file contains just one plot
  let bplotId = boxSelection === "report" ? 2 : 1;
  console.timeEnd('getPlotFromHtml scatter')
  console.time('getPlotFromHtml box')
  const boxes = getPlotFromHtml(bhtml, bplotId);
  console.timeEnd('getPlotFromHtml box')
  return { scatters, boxes };
}

export async function getReportHtml(
  jobid: number,
  module: number,
  interactivness: number,
  bartenderToken: string,
  moduleIndexPadding: number,
  moduleName = "caprieval",
  htmlFilename = "report.html"
) {
  const prefix = buildAnalyisPath({
    moduleIndex: module,
    moduleName,
    interactivness,
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
  const re = new RegExp(`<script id="data${plotId}" type="application\\/json">([\\s\\S]*?)<\\/script>`)
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
  return tsvParse(body, autoType) as any as CaprievalStructureRow[];
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
  moduleIndex: number,
  capriDir: string,
  weights: Weights,
  bartenderToken: string
) {
  const body = {
    capri_dir: capriDir,
    module_nr: moduleIndex,
    ...weights,
  };
  const client = createClient(bartenderToken);
  const { data, error } = await client.POST(
    "/api/job/{jobid}/interactive/rescore",
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
    throw new Error(`rescore failed with return code ${data.returncode}`);
  }
}
