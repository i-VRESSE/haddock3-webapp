import {
  InferOutput,
  pipe,
  transform,
  object,
  number,
  finite,
  parse,
  picklist,
  string,
  union,
} from "valibot";
import {
  buildPath,
  getJobfile,
  listOutputFiles,
  getModuleIndexPadding,
  buildAnalyisPath,
  fetchHtml,
} from "~/models/job.server";
import type { PlotlyProps } from "~/components/PlotlyPlot";
import type { DirectoryItem } from "~/bartender-client/types";
import { hasInteractiveVersion } from "../models/module_utils";
import {
  CAPRIEVAL_SCATTERPLOT_CHOICES,
  CAPRIEVAL_BOXPLOT_CHOICES,
} from "./constants";
import type { ClusterTable } from "@i-vresse/haddock3-ui/table/ClusterTable";
import type { StructureTable } from "@i-vresse/haddock3-ui/table/StructureTable";
import { BartenderError } from "~/models/errors";
import { getDataFromHtml, getPlotFromHtml } from "~/lib/html";

// Package does not expose types, so extract them from the components
export type Table =
  | Parameters<typeof StructureTable>[0]
  | Parameters<typeof ClusterTable>[0];

export const WeightsSchema = object({
  // could use minimum/maximum from catalog,
  // if they had sane values instead of -9999/9999
  w_elec: pipe(union([string(), number()]), transform(Number), finite()),
  w_vdw: pipe(union([string(), number()]), transform(Number), finite()),
  w_desolv: pipe(union([string(), number()]), transform(Number), finite()),
  w_bsa: pipe(union([string(), number()]), transform(Number), finite()),
  w_air: pipe(union([string(), number()]), transform(Number), finite()),
});
export type Weights = InferOutput<typeof WeightsSchema>;

export async function getWeights({
  jobid,
  module,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  module: number;
  isInteractive?: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
}): Promise<Weights> {
  const path = buildPath({
    moduleIndex: module,
    moduleName: "caprieval",
    isInteractive,
    suffix: "weights_params.json",
    moduleIndexPadding: moduleIndexPadding,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  if (!response.ok) {
    throw new BartenderError(`Could not get weights_params.json`, {
      cause: response,
    });
  }
  const body = await response.json();
  return parse(WeightsSchema, body);
}

export async function getCaprievalModuleInfo(
  jobid: number,
  bartenderToken: string,
  moduleIndex: number = -1,
): Promise<[number, boolean, number]> {
  const files = await listOutputFiles(jobid, bartenderToken, 1);
  if (moduleIndex === -1) {
    moduleIndex = getLastCaprievalModule(files)[0];
  }
  const pad = getModuleIndexPadding(files);
  const interactivness = hasInteractiveVersion(moduleIndex, files);
  return [moduleIndex, interactivness, pad];
}

export interface CaprievalData {
  scatters: PlotlyProps;
  boxes: PlotlyProps;
  table: Table;
}

export function getPlotSelection(url: string) {
  const params = new URL(url).searchParams;
  const scatterSelection = params.get("ss") || "report";
  const boxSelection = params.get("bs") || "report";
  const ScatterSchema = picklist(
    Object.keys(CAPRIEVAL_SCATTERPLOT_CHOICES) as [string, ...string[]],
  );
  const BoxSchema = picklist(
    Object.keys(CAPRIEVAL_BOXPLOT_CHOICES) as [string, ...string[]],
  );
  // TODO present nice error message
  return {
    scatterSelection: parse(ScatterSchema, scatterSelection),
    boxSelection: parse(BoxSchema, boxSelection),
  };
}

export async function getCaprievalData({
  jobid,
  module,
  bartenderToken,
  moduleIndexPadding,
  scatterSelection,
  boxSelection,
  isInteractive = false,
  moduleName = "caprieval",
  structurePrefix = "files/output/module",
}: {
  jobid: number;
  module: number;
  isInteractive?: boolean;
  bartenderToken: string;
  moduleIndexPadding: number;
  scatterSelection: string;
  boxSelection: string;
  moduleName?: string;
  structurePrefix?: string;
}): Promise<CaprievalData> {
  const shtml = await fetchHtml({
    jobid,
    module,
    isInteractive,
    bartenderToken,
    moduleIndexPadding,
    moduleName,
    htmlFilename: `${scatterSelection}.html`,
  });
  const scatters = getPlotFromHtml(shtml, 1);
  let bhtml: string;
  if (scatterSelection === "report" && boxSelection === "report") {
    // if both are report, we can reuse the html
    bhtml = shtml;
  } else {
    bhtml = await fetchHtml({
      jobid,
      module,
      isInteractive,
      bartenderToken,
      moduleIndexPadding,
      moduleName,
      htmlFilename: `${boxSelection}.html`,
    });
  }
  // plot id is always 1 for non-report plot as html file contains just one plot
  const bplotId = boxSelection === "report" ? 2 : 1;
  const boxes = getPlotFromHtml(bhtml, bplotId);

  let thtml: string;
  if (scatterSelection === "report") {
    thtml = shtml;
  } else if (boxSelection === "report") {
    thtml = bhtml;
  } else {
    thtml = await fetchHtml({
      jobid,
      module,
      isInteractive,
      bartenderToken,
      moduleIndexPadding,
      moduleName,
      htmlFilename: `report.html`,
    });
  }
  const table = prefixTable(getTableFromHtml(thtml), structurePrefix);

  return { scatters, boxes, table };
}

export function getTableFromHtml(html: string, tableId = 2) {
  return getDataFromHtml<Table>(html, `datatable${tableId}`);
}

export function getLastCaprievalModule(files: DirectoryItem): [number, number] {
  if (!files.children) {
    throw new Error("No modules found");
  }
  const modules = [...files.children].reverse();
  for (const module of modules || []) {
    if (
      module.is_dir &&
      module.name.endsWith("caprieval") &&
      !module.name.includes("_interactive")
    ) {
      const index = parseInt(module.name.split("_")[0]);
      const moduleIndexPadding = getModuleIndexPadding(files);
      return [index, moduleIndexPadding];
    }
  }
  throw new Error("No caprieval module found");
}

export function buildBestRankedPath(
  module: number,
  moduleIndexPadding: number,
) {
  // output/analysis/12_caprieval_analysis/summary.tgz
  return buildAnalyisPath({
    moduleIndex: module,
    moduleName: "caprieval",
    moduleIndexPadding,
    suffix: "summary.tgz",
  });
}

function prefixTable(table: Table, structurePrefix: string) {
  if ("clusters" in table) {
    type Cluster = Parameters<typeof ClusterTable>[0]["clusters"][0];
    table.clusters = table.clusters.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (key.startsWith("best")) {
            return [key, `${structurePrefix}${value}`];
          }
          return [key, value];
        }),
      ) as Cluster;
    });
  } else {
    table.structures = table.structures.map((row) => ({
      ...row,
      model: `${structurePrefix}${row.model}`,
    }));
  }
  return table;
}
