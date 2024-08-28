import {
  array,
  GenericSchema,
  parse,
  InferOutput,
  instance,
  maxLength,
  minLength,
  pipe,
  transform,
  union,
} from "valibot";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";

export function parseFormData<T extends GenericSchema>(
  formData: FormData,
  schema: T,
) {
  // A file input when no file is selected will have an empty name and 0 size
  // we do not want those, so we remove them
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.name === "") {
      formData.delete(key);
    }
  }
  const entries = Array.from(formData.keys()).map((key) => [
    key,
    formData.getAll(key).length <= 1 ? formData.get(key) : formData.getAll(key),
  ]);
  const obj = Object.fromEntries(entries);
  return parse(schema, obj);
}

export const moleculeFieldDescription = getModuleDescriptions("global", [
  "molecules",
]).molecules;
export const MoleculesSchema = union([
  pipe(
    instance(File, "Must be a file"),
    transform((v) => [v]),
  ),
  pipe(
    array(instance(File, "Must be a file")),
    minLength(moleculeFieldDescription.minimum),
    maxLength(moleculeFieldDescription.maximum),
  ),
]);
export type MoleculesSchema = InferOutput<typeof MoleculesSchema>;
