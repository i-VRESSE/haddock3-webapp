import { BaseSchema, parse } from "valibot";

export function parseFormData<T extends BaseSchema>(
  formData: FormData,
  schema: T,
) {
  const obj = Object.fromEntries(formData.entries());
  return parse(schema, obj);
}
