import { getPlotFromHtml } from "~/caprieval/caprieval.server";
import type { PlotlyProps } from "~/components/PlotlyPlot";
import { buildPath, fetchHtml, listOutputFiles } from "~/models/job.server";
import { moduleInfo } from "~/models/module_utils";

export interface ContactMapCluster {
  id: number;
  name: string;
  chordchart: PlotlyProps;
  heatmap: PlotlyProps;
  contacts: string;
  heavyatoms_interchain_contacts: string;
  interchain_contacts: string;
}

interface ModuleInfo {
  indexPadding: number;
  name: string;
  index: number;
  jobid: number;
}

export async function isContactMapModule(
  jobid: number,
  index: number,
  bartenderToken: string
) {
  const outputFiles = await listOutputFiles(jobid, bartenderToken, 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [name, hasInteractiveVersion, indexPadding] = moduleInfo(
    outputFiles,
    index
  );
  if (name !== "contactmap") {
    throw new Error(`Module ${index} is not a contactmap`);
  }
  return { indexPadding, name, jobid, index };
}

export async function getClusters(
  module: ModuleInfo,
  bartenderToken: string
): Promise<number[]> {
  const contents = await fetchHtml(
    module.jobid,
    module.index,
    false,
    bartenderToken,
    module.indexPadding,
    module.name,
    "ContactMapReport.html",
    false
  );
  return parseReport(contents);
}

export async function getClusterInfo(
  clusterId: number,
  module: ModuleInfo,
  bartenderToken: string
): Promise<ContactMapCluster> {
  const [chordchart, heatmap] = await Promise.all([
    getChartData(clusterId, module, bartenderToken, "contmap_chordchart"),
    getChartData(clusterId, module, bartenderToken, "contmap_heatmap"),
  ]);
  return {
    id: clusterId,
    name: `Cluster_${clusterId}`,
    contacts: downloadPath(
      module.jobid,
      module,
      `cluster${clusterId}_contmap_contacts.tsv`
    ),
    heavyatoms_interchain_contacts: downloadPath(
      module.jobid,
      module,
      `cluster${clusterId}_heavyatoms_interchain_contacts.tsv`
    ),
    interchain_contacts: downloadPath(
      module.jobid,
      module,
      `cluster${clusterId}_interchain_contacts.tsv`
    ),
    chordchart,
    heatmap,
  };
}

async function getChartData(
  clusterId: number,
  module: ModuleInfo,
  bartenderToken: string,
  filename: string
): Promise<PlotlyProps> {
  /// cluster4_contmap_chordchart.html
  const html = await fetchHtml(
    module.jobid,
    module.index,
    false,
    bartenderToken,
    module.indexPadding,
    module.name,
    `cluster${clusterId}_${filename}.html`,
    false
  );
  return getPlotFromHtml(html, 1);
}

function downloadPath(jobid: number, module: ModuleInfo, filename: string) {
  return (
    `/jobs/${jobid}/files/` +
    buildPath({
      moduleIndex: module.index,
      moduleName: module.name,
      isInteractive: false,
      moduleIndexPadding: module.indexPadding,
      suffix: filename,
    })
  );
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
