import { type Structure } from "ngl";
import { Input } from "~/components/ui/input";
import { loadStructure } from "./molecule.client";

export function PDBFileInput({
  name,
  required,
  onStructureLoad,
}: {
  name: string;
  required?: boolean;
  onStructureLoad: (structure: Structure, file: File) => void;
}) {
  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const structure = await loadStructure(file);
    onStructureLoad(structure, file);
  }

  return (
    <Input
      type="file"
      id={name}
      name={name}
      required={required}
      accept=".pdb"
      onChange={onChange}
    />
  );
}
