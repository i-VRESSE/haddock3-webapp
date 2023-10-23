import type { DirectoryItem } from "~/bartender-client";
import { getModuleIndexPadding, listOutputFiles } from "~/models/job.server";

export function interactivenessOfModule(
  module: number,
  files: DirectoryItem
): number {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  let interactivness = 0;
  const moduleIndexPadding = getModuleIndexPadding(files);
  const moduleIndexPadded = module.toString().padStart(moduleIndexPadding, "0");
  for (const m of modules) {
    if (
      m.isDir &&
      m.name.startsWith(`${moduleIndexPadded}_`) &&
      m.name.endsWith("interactive")
    ) {
      interactivness += 1;
    }
  }
  return interactivness;
}
export interface ClusterRow {
  rank: number;
  model_name: string;
  score: number;
  cluster_id: number | "-";
}
export function nameOfModule(moduleIndex: number, files: DirectoryItem) {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const m of modules) {
    // if module name has _ in it then this will break
    const module = m.name.split("_");
    if (m.isDir && parseInt(module[0]) === moduleIndex) {
      return module[1];
    }
  }
  throw new Error(`No module with index ${moduleIndex} found`);
}
export async function parseClusterTsv(body: string) {
  const filledLines = removeEmptyLines(body);
  const { tsvParse, autoType } = await import("d3-dsv");
  const rows = tsvParse(filledLines, autoType) as any as Promise<ClusterRow[]>;
  return rows;
}
export function removeEmptyLines(body: string) {
  return body
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}
/**
 * @returns [moduleName, interactivness, moduleIndexPadding]
 */

export async function moduleInfo(
  jobid: number,
  moduleIndex: number,
  bartenderToken: string
): Promise<[string, number, number]> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  const moduleName = nameOfModule(moduleIndex, files);
  const pad = getModuleIndexPadding(files);
  const interactivness = interactivenessOfModule(moduleIndex, files);
  return [moduleName, interactivness, pad];
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
