import type { ICatalog } from "@i-vresse/wb-core/dist/types";

import easy from "./haddock3.easy.json";
import expert from "./haddock3.expert.json";
import guru from "./haddock3.guru.json";
import type { ExpertiseLevel } from "@prisma/client";
import { JOB_OUTPUT_DIR } from "~/models/constants";

export async function getCatalog(level: ExpertiseLevel) {
  // Tried serverDependenciesToBundle in remix.config.js but it didn't work
  // Fallback to using dynamic import
  const { prepareCatalog } = await import("@i-vresse/wb-core/dist/catalog.js");
  const catalogs: Record<string, ICatalog> = {
    easy: easy as unknown as ICatalog,
    expert: expert as unknown as ICatalog,
    guru: guru as unknown as ICatalog,
  };
  const catalog = catalogs[level];
  if (!(level in catalogs)) {
    throw new Error(`No catalog found for level ${level}`);
  }
  catalog.examples = {};
  // Set default run_dir to JOB_OUTPUT_DIR
  if (catalog.global.schema.properties && typeof catalog.global.schema.properties.run_dir === "object") {
    catalog.global.schema.properties.run_dir.default = JOB_OUTPUT_DIR
  }
  return prepareCatalog(catalog);
}
