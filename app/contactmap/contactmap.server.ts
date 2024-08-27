import { InferOutput, boolean, object } from "valibot";
import type { PlotlyProps } from "~/components/PlotlyPlot";
import { getPlotFromHtml } from "~/lib/html";
import { fetchHtml, getParamsCfg, listOutputFiles } from "~/models/job.server";
import { downloadPath, ModuleInfo, moduleInfo } from "~/models/module_utils";

export interface ContactMapCluster {
  id: number;
  name: string;
  chordchart?: PlotlyProps;
  heatmap?: PlotlyProps;
  contacts: string;
  heavyatoms_interchain_contacts: string;
  interchain_contacts: string;
}

export async function isContactMapModule(
  jobid: number,
  index: number,
  bartenderToken: string,
): Promise<ModuleInfo> {
  const outputFiles = await listOutputFiles(jobid, bartenderToken, 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, hasInteractiveVersion, indexPadding] = moduleInfo(
    outputFiles,
    index,
  );
  if (name !== "contactmap") {
    throw new Error(`Module ${index} is not a contactmap`);
  }
  return { indexPadding, name, jobid, index, hasInteractiveVersion };
}

export const Schema = object({
  // use underscore to match haddock3 naming
  generate_chordchart: boolean(),
  generate_heatmap: boolean(),
});
export type Schema = InferOutput<typeof Schema>;

export async function getParams({
  jobid,
  moduleIndex,
  bartenderToken,
  moduleIndexPadding,
}: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
}): Promise<Schema> {
  return await getParamsCfg({
    jobid,
    moduleIndex,
    bartenderToken,
    moduleIndexPadding,
    moduleName: "contactmap",
    schema: Schema,
    isInteractive: false,
  });
}

export async function getClusters(
  module: ModuleInfo,
  bartenderToken: string,
): Promise<number[]> {
  const contents = await fetchHtml({
    bartenderToken,
    jobid: module.jobid,
    module: module.index,
    moduleIndexPadding: module.indexPadding,
    moduleName: module.name,
    isInteractive: false,
    htmlFilename: "ContactMapReport.html",
    isAnalysis: false,
  });
  return parseReport(contents);
}

export async function getClusterInfo(
  clusterId: number,
  module: ModuleInfo,
  bartenderToken: string,
  params: Schema,
): Promise<ContactMapCluster> {
  let chordchart: PlotlyProps | undefined = undefined;
  if (params.generate_chordchart) {
    chordchart = await getChartData(
      clusterId,
      module,
      bartenderToken,
      "contmap_chordchart",
    );
  }
  let heatmap: PlotlyProps | undefined = undefined;
  if (params.generate_heatmap) {
    heatmap = await getChartData(
      clusterId,
      module,
      bartenderToken,
      "contmap_heatmap",
    );
  }
  return {
    id: clusterId,
    name: `Cluster_${clusterId}`,
    contacts: downloadPath(module, `cluster${clusterId}_contmap_contacts.tsv`),
    heavyatoms_interchain_contacts: downloadPath(
      module,
      `cluster${clusterId}_contmap_heavyatoms_interchain_contacts.tsv`,
    ),
    interchain_contacts: downloadPath(
      module,
      `cluster${clusterId}_contmap_interchain_contacts.tsv`,
    ),
    chordchart,
    heatmap,
  };
}

async function getChartData(
  clusterId: number,
  module: ModuleInfo,
  bartenderToken: string,
  filename: string,
): Promise<PlotlyProps> {
  /// cluster4_contmap_chordchart.html
  const html = await fetchHtml({
    bartenderToken,
    jobid: module.jobid,
    module: module.index,
    moduleIndexPadding: module.indexPadding,
    moduleName: module.name,
    isInteractive: false,
    htmlFilename: `cluster${clusterId}_${filename}.html`,
    isAnalysis: false,
  });
  return getPlotFromHtml(html, 1);
}

export function parseReport(content: string) {
  const re = /<b>Cluster_(\d+):<\/b>/g;
  const matches = content.matchAll(re);
  const clusters = [];
  for (const match of matches) {
    clusters.push(parseInt(match[1]));
  }
  return clusters;
}
