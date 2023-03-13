import type { ICatalog } from "@i-vresse/wb-core/dist/types";

import easy from "./haddock3.easy.json";
import expert from "./haddock3.expert.json";
import guru from "./haddock3.guru.json";

export async function getCatalog(level: string) {
  const { prepareCatalog } = await import("@i-vresse/wb-core/dist/catalog.js");
  const catalogs: Record<string, ICatalog> = {
    easy: easy as unknown as ICatalog,
    expert: expert as unknown as ICatalog,
    guru: guru as unknown as ICatalog,
  };
  const catalog = catalogs[level];
  if (!(level in catalogs)) {
    throw new Error(`No catalog found for level ${level}`)
  }
  // TODO drop examples, they will be shown as scenarios
  catalog.examples = {}
  return prepareCatalog(catalog);
}
