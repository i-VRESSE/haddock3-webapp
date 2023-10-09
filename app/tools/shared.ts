import type { DirectoryItem } from "~/bartender-client";
import { getModuleIndexPadding } from "~/models/job.server";

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
