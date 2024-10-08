import type { DirectoryItem } from "~/bartender-client/types";
import { buildPath, getModuleIndexPadding } from "~/models/job.server";
import { prefix } from "~/prefix";

export function hasInteractiveVersion(
  moduleIndex: number,
  files: DirectoryItem,
) {
  const moduleIndexPadding = getModuleIndexPadding(files);
  const moduleIndexPadded = moduleIndex
    .toString()
    .padStart(moduleIndexPadding, "0");
  let hasInteractive = false;
  let hasIndex = false;
  if (!files.children) {
    throw new Error("No modules found");
  }
  for (const m of files.children) {
    if (m.is_dir && m.name.startsWith(`${moduleIndexPadded}_`)) {
      hasIndex = true;
      if (m.name.endsWith("_interactive")) {
        hasInteractive = true;
        break;
      }
    }
  }
  if (!hasIndex) {
    throw new Error(`No module with index ${moduleIndex} found`);
  }
  return hasInteractive;
}

function nameOfModule(moduleIndex: number, files: DirectoryItem) {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const m of modules) {
    // if module name has _ in it then this will break
    const module = m.name.split("_");
    if (m.is_dir && parseInt(module[0]) === moduleIndex) {
      return module[1];
    }
  }
  throw new Error(`No module with index ${moduleIndex} found`);
}

/**
 * @returns [moduleName, hasInteractive, moduleIndexPadding]
 */
export function moduleInfo(
  files: DirectoryItem,
  moduleIndex: number,
): [string, boolean, number] {
  const moduleName = nameOfModule(moduleIndex, files);
  const pad = getModuleIndexPadding(files);
  const interactivness = hasInteractiveVersion(moduleIndex, files);
  return [moduleName, interactivness, pad];
}

export interface JobModuleInfo {
  indexPadding: number;
  name: string;
  index: number;
  jobid: number;
  hasInteractiveVersion: boolean;
}
export function downloadPath(module: JobModuleInfo, filename: string) {
  return (
    `${prefix}jobs/${module.jobid}/files/` +
    buildPath({
      moduleIndex: module.index,
      moduleName: module.name,
      isInteractive: false,
      moduleIndexPadding: module.indexPadding,
      suffix: filename,
    })
  );
}
