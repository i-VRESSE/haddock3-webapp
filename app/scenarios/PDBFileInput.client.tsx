import { Input } from "~/components/ui/input";
import { useState } from "react";
import { MolViewerDialog } from "./MolViewerDialog.client";

export function PDBFileInput({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [file, setFile] = useState<File | undefined>();

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFile(file);
  }

  return (
    <div className="flex">
      <Input
        type="file"
        id={name}
        name={name}
        required={required}
        accept=".pdb"
        onChange={onChange}
      />
      <MolViewerDialog structure={file} />
    </div>
  );
}
