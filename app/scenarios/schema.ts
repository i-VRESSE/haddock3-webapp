import { BaseSchema, mimeType, parse } from "valibot";

export const pdbMimeType = mimeType<File>(
  [
    "chemical/x-pdb",
    "chemical/x-pdbx",
    "application/vnd.palm",
    "application/x-aportisdoc",
  ],
  "Please select a PDB file"
);

export function parseFormData<T extends BaseSchema>(
  formData: FormData,
  schema: T
) {
  const obj = Object.fromEntries(formData.entries());
  return parse(schema, obj);
}
