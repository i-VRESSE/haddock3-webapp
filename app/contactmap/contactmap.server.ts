import { boolean, InferOutput, object } from "valibot";

import type { PlotlyProps } from "~/components/PlotlyPlot";
import { getPlotFromHtml } from "~/lib/html";
import { fetchHtml, getParamsCfg, listOutputFiles } from "~/models/job.server";
import { downloadPath, JobModuleInfo, moduleInfo } from "~/models/module_utils";

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
): Promise<JobModuleInfo> {
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
  module: JobModuleInfo,
  bartenderToken: string,
): Promise<{ ids: number[]; clustered: boolean; fns: string[] }> {
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
  const clusters = parseClusteredReport(contents);
  if (clusters.length === 0) {
    const models = parseUnClusteredReport(contents);
    return { ...models, clustered: false };
  }
  return { ids: clusters, fns: [], clustered: true };
}

export async function getClusterInfo(
  clusterId: number,
  module: JobModuleInfo,
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

export async function getModelInfo(
  modelId: number,
  module: JobModuleInfo,
  bartenderToken: string,
  params: Schema,
  filename: string,
): Promise<ContactMapCluster> {
  // Unclustered_contmap_mdref_1_alascan_contacts.tsv
  const prefix = `Unclustered_contmap_${filename}`;

  let chordchart: PlotlyProps | undefined = undefined;
  if (params.generate_chordchart) {
    chordchart = await getChartDataOfModel(
      prefix,
      module,
      bartenderToken,
      "chordchart",
    );
  }
  let heatmap: PlotlyProps | undefined = undefined;
  if (params.generate_heatmap) {
    heatmap = await getChartDataOfModel(
      prefix,
      module,
      bartenderToken,
      "heatmap",
    );
  }
  return {
    id: modelId,
    name: `Model ${modelId}`,
    contacts: downloadPath(module, `${prefix}_contacts.tsv`),
    heavyatoms_interchain_contacts: downloadPath(
      module,
      // Unclustered_contmap_mdref_2_alascan_heavyatoms_interchain_contacts.tsv
      `${prefix}_heavyatoms_interchain_contacts.tsv`,
    ),
    interchain_contacts: downloadPath(
      module,
      `${prefix}_interchain_contacts.tsv`,
    ),
    chordchart,
    heatmap,
  };
}

async function getChartData(
  clusterId: number,
  module: JobModuleInfo,
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

async function getChartDataOfModel(
  prefix: string,
  module: JobModuleInfo,
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
    htmlFilename: `${prefix}_${filename}.html`,
    isAnalysis: false,
  });
  return getPlotFromHtml(html, 1);
}

export function parseClusteredReport(content: string) {
  const re = /<b>Cluster_(\d+):<\/b>/g;
  const matches = content.matchAll(re);
  const clusters = [];
  for (const match of matches) {
    clusters.push(parseInt(match[1]));
  }
  return clusters;
}

export function parseUnClusteredReport(content: string) {
  // Unclustered_contmap_mdref_1_alascan_chordchart.html
  const re = /Unclustered_contmap_(\w+?)_(\d+)_(\w+?)_chordchart.html/g;
  const matches = content.matchAll(re);
  const ids = [];
  const fns = [];
  for (const match of matches) {
    ids.push(parseInt(match[2]));
    fns.push(`${match[1]}_${match[2]}_${match[3]}`);
  }
  return { ids, fns };
}
