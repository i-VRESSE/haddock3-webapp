import type { ICatalog } from "@i-vresse/wb-core/dist/types";
import rawcatalog from "./haddock3.guru.json?raw";

const catalog = JSON.parse(rawcatalog);

export interface Description {
  description: string;
  title: string;
  longDescription: string;
  default: number;
  maximum: number;
  minimum: number;
}

function descriptionsFromSchema(
  schema: ICatalog["global"]["schema"],
  whitelist: string[],
) {
  const descriptions: Record<string, Description> = {};
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
    // TODO handle type boolean and string,
    // now only works for number and array as those are used at the moment
    descriptions[name] = {
      description: field.description || "",
      title: field.title || name,
      longDescription: (field as { $comment?: string })["$comment"] || "",
      default: field.default as number,
      maximum: field.maximum ?? field.maxItems ?? 99999,
      minimum: field.minimum ?? field.minItems ?? -1,
    };
  }
  return descriptions;
}

/**
 * Retrieves the descriptions of modules from the guru catalog based on the module name and whitelist.
 *
 * @param moduleName - The name of the module.
 * If "global", the global schema will be used.
 * @param whitelist - An array of strings representing the whitelist of descriptions to retrieve.
 * If empty, all descriptions will be retrieved.
 * @returns An array of descriptions from the schema.
 * @throws Error if no schema is found for the specified module.
 */
export function getModuleDescriptions(moduleName: string, whitelist: string[]) {
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
