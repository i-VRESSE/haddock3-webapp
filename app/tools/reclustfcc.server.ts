import {
  buildPath,
  getJobfile,
  getModuleIndexPadding,
  listOutputFiles,
  safeApi,
} from "~/models/job.server";
import { interactivenessOfModule } from "./shared";
import type { DirectoryItem } from "~/bartender-client";
import { object, number, coerce, finite, type Output } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";

export const Schema = object({
  fraction: coerce(number([finite()]), Number),
  strictness: coerce(number([finite()]), Number),
  threshold: coerce(number([finite()]), Number),
});
export type Schema = Output<typeof Schema>;

function nameOfModule(moduleIndex: number, files: DirectoryItem) {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const m of modules) {
    // TODO can module name have _ in it?, if so this will break
    const module = m.name.split("_");
    if (m.isDir && parseInt(module[0]) === moduleIndex) {
      return module[1];
    }
  }
  throw new Error(`No module with index ${moduleIndex} found`);
}

export async function step2reclusterModule(
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

export async function getParams(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
): Promise<Schema> {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    interactivness,
    suffix: "params.cfg",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config: any = parseTOML(body, { bigint: false });
  /*
    In params.cfg:
    threshold = 1
    strictness = 0.75
    fraction = 0.3
    */
  if (!interactivness) {
    // non-interactive has `[clustfcc]` section
    config = config.clustfcc;
  }
  const params = {
    // TODO haddock3-re clustfcc CLI accepts fraction while module only has fraction_cutoff
    // use fraction_cutoff in CLI
    fraction: interactivness ? config.fraction : config.fraction_cutoff,
    strictness: config.strictness,
    threshold: config.threshold,
  };
  return params;
}

export interface ClusterRow {
  rank: number;
  model_name: string;
  score: number;
  cluster_id: number;
}

export async function getClusters(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
) {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    interactivness,
    suffix: "clustfcc.tsv",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const filledLines = removeEmptyLines(body);
  const { tsvParse, autoType } = await import("d3-dsv");
  const rows = tsvParse(filledLines, autoType) as any as Promise<ClusterRow[]>;
  return rows;
}

function removeEmptyLines(body: string) {
  return body
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

export async function reclustfcc(
  jobid: number,
  clustfccDir: string,
  params: Schema,
  bartenderToken: string
) {
  const body = {
    clustfcc_dir: clustfccDir,
    ...params,
  };
  const result = await safeApi(bartenderToken, async (api) => {
    const response = await api.runInteractiveApp({
      jobid,
      application: "reclustfcc",
      body,
    });
    return response;
  });
  if (result.returncode !== 0) {
    console.error(result);
    throw new Error(`rescore failed with return code ${result.returncode}`);
  }
}
