import { Structure, autoLoad } from "ngl";
import { Input } from "~/components/ui/input";

export function PDBFileInput({
  name,
  required,
  onStructureLoad,
}: {
  name: string;
  required?: boolean;
  onStructureLoad: (structure: Structure) => void;
}) {
  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const structure: Structure = await autoLoad(file);
    if (structure && onStructureLoad) {
      onStructureLoad(structure);
    }
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
