import type { ICatalog } from "@i-vresse/wb-core/dist/types";

import easy from "./haddock3.easy.json?raw";
import expert from "./haddock3.expert.json?raw";
import guru from "./haddock3.guru.json?raw";
import type { ExpertiseLevel } from "~/drizzle/schema.server";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog.js";

// Load catalogs during startup
const catalogs = loadCatalogs();

export function getCatalog(level: ExpertiseLevel) {
  if (!(level in catalogs)) {
    throw new Error(`No catalog found for level ${level}`);
  }
  return catalogs[level];
}

function loadCatalog(catalog: ICatalog) {
  catalog.examples = {};
  // Set default run_dir to JOB_OUTPUT_DIR
  return hideExecutionParameters(alwaysPlotMatrix(prepareCatalog(catalog)));
}

function loadCatalogs() {
  return {
    easy: loadCatalog(JSON.parse(easy) as unknown as ICatalog),
    expert: loadCatalog(JSON.parse(expert) as unknown as ICatalog),
    guru: loadCatalog(JSON.parse(guru) as unknown as ICatalog),
  } as const;
}

function alwaysPlotMatrix(catalog: ICatalog) {
  for (const nodes of Object.values(catalog.nodes)) {
    if (
      nodes.schema.properties &&
      nodes.schema.properties.plot_matrix &&
      typeof nodes.schema.properties.plot_matrix === "object"
    ) {
      nodes.schema.properties.plot_matrix.default = true;
    }
  }
  return catalog;
}

function hideExecutionParameters(catalog: ICatalog) {
  const executionParameters = [
    "run_dir",
    "mode",
    "ncores",
    "max_cpus",
    "batch_type",
    "queue",
    "queue_limit",
    "concat",
    "cns_exec",
    "self_contained",
    // Not really execution parameters, but we want to hide them as well
    "postprocess",
    "clean",
    "offline",
    "less_io",
  ];
  const globalProps = catalog.global.schema.properties!;
  for (const param of executionParameters) {
    const prop = globalProps[param];
    if (typeof prop === "boolean" || prop === undefined || prop === null) {
      continue;
    }
    prop.description = undefined;
  }
  const uiSchema = Object.fromEntries(
    executionParameters.map((param) => [
      param,
      {
        "ui:widget": "hidden",
      },
    ]),
  );
  catalog.global.uiSchema = {
    ...catalog.global.uiSchema,
    ...uiSchema,
  };
  return catalog;
}

export function getCatalogForBuilder(catalogLevel: ExpertiseLevel) {
  const catalog = structuredClone(getCatalog(catalogLevel));
  if (
    catalog.global.schema.properties &&
    typeof catalog.global.schema.properties.run_dir === "object"
  ) {
    // Delete run_dir as it is always set when workflow.cfg is rewritten
    // downside that when you download from builder it is no longer valid on cli
    delete catalog.global.schema.properties.run_dir;
    catalog.global.schema.required = catalog.global.schema.required?.filter(
      (prop) => prop !== "run_dir",
    );
  }
  return catalog;
}
