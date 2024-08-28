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
  type JobModuleInfo,
  moduleInfo,
} from "~/models/module_utils";

export async function isAlaScanModule(
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
  if (name !== "alascan") {
    throw new Error(`Module ${index} is not a alascan`);
  }
  return { indexPadding, name, jobid, index, hasInteractiveVersion };
}

function listOutputFilesOfModule(
  moduleInfo: JobModuleInfo,
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

export interface ModelInfo {
  id: string;
  // Path to cluster_1_model_2_alascan.pdb.gz
  pdb: string;
  // Path to scan_cluster_1_model_1.csv
  csv: string;
}

function modelInfo(
  moduleInfo: JobModuleInfo,
  clusterId: string,
  modelId: string,
  fromModule: string = "",
) {
  return {
    id: modelId,
    pdb: downloadPath(
      moduleInfo,
      clusterId === "-"
        ? `${fromModule}_${modelId}_alascan.pdb.gz`
        : `cluster_${clusterId}_model_${modelId}_alascan.pdb.gz`,
    ),
    csv: downloadPath(
      moduleInfo,
      clusterId === "-"
        ? `scan_${fromModule}_${modelId}.csv`
        : `scan_cluster_${clusterId}_model_${modelId}.csv`,
    ),
  };
}

export function getClustersAndModels(
  files: DirectoryItem,
  moduleInfo: JobModuleInfo,
) {
  if (!files.children) {
    throw new Error("No clusters found");
  }
  const clusterIds: string[] = [];
  const models: Record<string, ModelInfo[]> = {};
  // scan_clt_1.html to 1 or
  // scan_clt_-.html to -
  const clusterRegex = /^scan_clt_(\d+|-)\.html$/;
  // scan_cluster_1_model_1.csv or
  const clusteredModelRegex = /^scan_cluster_(\d+)_model_(\d+)\.csv$/;
  // scan_mdref_2.csv
  const unclusteredModelRegex = /^scan_(\w+)_(\d+)\.csv$/;
  for (const child of files.children) {
    const clusterMatch = child.name.match(clusterRegex);
    if (clusterMatch) {
      const clusterId = clusterMatch[1];
      clusterIds.push(clusterId);
    }
    const clusteredModelMatch = child.name.match(clusteredModelRegex);
    if (clusteredModelMatch) {
      const clusterId = clusteredModelMatch[1];
      const modelId = clusteredModelMatch[2];
      if (!models[clusterId]) {
        models[clusterId] = [];
      }
      models[clusterId].push(modelInfo(moduleInfo, clusterId, modelId));
    }
    const unclusteredModelMatch = child.name.match(unclusteredModelRegex);
    if (unclusteredModelMatch) {
      const fromModule = unclusteredModelMatch[1];
      const modelId = unclusteredModelMatch[2];
      if (fromModule === "clt" || fromModule.startsWith("cluster_")) {
        continue;
      }
      if (!models["-"]) {
        models["-"] = [];
      }
      models["-"].push(modelInfo(moduleInfo, "-", modelId, fromModule));
    }
  }
  if (clusterIds.length === 0) {
    throw new Error(`No clusters found`);
  }
  return { clusterIds, models };
}

export async function getClusters(
  moduleInfo: JobModuleInfo,
  bartenderToken: string,
) {
  const files = await listOutputFilesOfModule(moduleInfo, bartenderToken);
  return getClustersAndModels(files, moduleInfo);
}

export interface ClusterInfo {
  id: string;
  plot: PlotlyProps;
  csv: string;
  models: ModelInfo[];
}

export async function getClusterInfo(
  clusterId: string,
  module: JobModuleInfo,
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
    models: [],
  };
}
