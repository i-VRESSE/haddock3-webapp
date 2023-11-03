import type { ICatalog } from "@i-vresse/wb-core/dist/types";
import guru from "./haddock3.guru.json";

function descriptionsFromSchema(
  schema: ICatalog["global"]["schema"],
  whitelist: string[]
) {
  const descriptions: Record<
    string,
    {
      description: string;
      title: string;
      longDescription: string;
    }
  > = {};
  if (!schema.properties) {
    throw new Error("No properties found in schema");
  }
  for (const [name, field] of Object.entries(schema.properties)) {
    if (whitelist.length && !whitelist.includes(name)) {
      continue;
    }
    if (field === false || field === true) {
      continue;
    }
    descriptions[name] = {
      description: field.description || "",
      title: field.title || name,
      longDescription: (field as any)["$comment"] || "",
    };
  }
  return descriptions;
}

export function getModuleDescriptions(moduleName: string, whitelist: string[]) {
  const catalog = guru as unknown as ICatalog;
  let schema: ICatalog["global"]["schema"] | undefined = undefined;
  if (moduleName !== "global") {
    for (const node of catalog.nodes) {
      if (moduleName === node.id) {
        schema = node.schema;
        break;
      }
    }
  } else {
    schema = catalog.global.schema;
  }
  if (!schema) {
    throw new Error(`No schema found for module ${moduleName}`);
  }
  return descriptionsFromSchema(schema, whitelist);
}
