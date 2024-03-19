import type { ICatalog } from "@i-vresse/wb-core/dist/types";

import easy from "./haddock3.easy.json";
import expert from "./haddock3.expert.json";
import guru from "./haddock3.guru.json";
import type { ExpertiseLevel } from "~/drizzle/schema.server";
import { JOB_OUTPUT_DIR } from "~/bartender-client/constants";
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
  if (
    catalog.global.schema.properties &&
    typeof catalog.global.schema.properties.run_dir === "object"
  ) {
    catalog.global.schema.properties.run_dir.default = JOB_OUTPUT_DIR;
  }
  return HideExecutionParameters(prepareCatalog(catalog));
}

function loadCatalogs() {
  return {
    easy: loadCatalog(easy as unknown as ICatalog),
    expert: loadCatalog(expert as unknown as ICatalog),
    guru: loadCatalog(guru as unknown as ICatalog),
  } as const;
}

function HideExecutionParameters(catalog: ICatalog) {
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
    ])
  );
  catalog.global.uiSchema = {
    ...catalog.global.uiSchema,
    ...uiSchema,
  };
  return catalog;
}
