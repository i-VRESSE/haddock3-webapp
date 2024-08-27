import type { DirectoryItem } from "~/bartender-client/types";
import type { PlotlyProps } from "~/components/PlotlyPlot";
import { getPlotFromHtml } from "~/lib/html";
import {
  buildPath,
  fetchHtml,
  listFilesAt,
  listOutputFiles,
} from "~/models/job.server";
import {
  downloadPath,
  type ModuleInfo,
  moduleInfo,
} from "~/models/module_utils";

export async function isAlaScanModule(
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
  if (name !== "alascan") {
    throw new Error(`Module ${index} is not a alascan`);
  }
  return { indexPadding, name, jobid, index, hasInteractiveVersion };
}

function listOutputFilesOfModule(
  moduleInfo: ModuleInfo,
  bartenderToken: string,
  maxDepth: number = 1,
): Promise<DirectoryItem> {
  const path = buildPath({
    moduleIndex: moduleInfo.index,
    moduleName: moduleInfo.name,
    isInteractive: moduleInfo.hasInteractiveVersion,
    moduleIndexPadding: moduleInfo.indexPadding,
  });
  return listFilesAt(moduleInfo.jobid, path, bartenderToken, maxDepth);
}

export async function getClusters(
  moduleInfo: ModuleInfo,
  bartenderToken: string,
) {
  const files = await listOutputFilesOfModule(moduleInfo, bartenderToken);
  if (!files.children) {
    throw new Error("No clusters found");
  }
  const clusterIds: string[] = [];
  // scan_clt_1.html to 1
  const regex = /scan_clt_(\d+)\.html/;
  for (const child of files.children) {
    const match = child.name.match(regex);
    if (match) {
      const clusterId = match[1];
      clusterIds.push(clusterId);
    }
  }
  if (clusterIds.length === 0) {
    throw new Error(`No clusters found`);
  }
  return clusterIds;
}

export interface ClusterInfo {
  id: string;
  plot: PlotlyProps;
  csv: string;
}

export async function getClusterInfo(
  clusterId: string,
  module: ModuleInfo,
  bartenderToken: string,
): Promise<ClusterInfo> {
  // scan_clt_1.html with plotly data at id=data1
  const html = await fetchHtml({
    bartenderToken,
    jobid: module.jobid,
    module: module.index,
    moduleIndexPadding: module.indexPadding,
    moduleName: module.name,
    isInteractive: false,
    htmlFilename: `scan_clt_${clusterId}.html`,
    isAnalysis: false,
  });
  const plot = getPlotFromHtml(html, 1);
  const csv = downloadPath(module, `scan_clt_${clusterId}.csv`);
  return {
    id: clusterId,
    plot,
    csv,
  };
}
