import { GenericSchema, parse } from "valibot";

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
  const obj = Object.fromEntries(formData.entries());
  return parse(schema, obj);
}
