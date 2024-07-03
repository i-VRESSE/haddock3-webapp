import { FormDescription } from "./FormDescription";
import { FormItem } from "./FormItem";
import { PDBFileInput } from "./PDBFileInput.client";

export function ReferenceStructureInput({
  label = "Reference structure",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <FormItem name="reference_fname" label={label}>
      <PDBFileInput name="reference_fname" />
      <FormDescription>{children}</FormDescription>
    </FormItem>
  );
}
