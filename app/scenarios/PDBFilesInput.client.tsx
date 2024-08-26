import { Input } from "~/components/ui/input";
import { useState } from "react";

import { NGLComponent, NGLStage } from "@i-vresse/haddock3-ui";

import { Button } from "~/components/ui/button";

import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export function MolViewerDialog({
  structure,
  label,
}: {
  structure?: File;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!structure}
          className="p-0"
          title="Preview in 3D"
          variant="link"
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2/3 h-2/3 w-2/3">
        {structure !== undefined && open && (
          <NGLStage>
            <NGLComponent structure={structure} chain="" />
          </NGLStage>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PDBFilesInput({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFiles(event.target.files != null ? Array.from(event.target.files) : []);
  }

  return (
    <div className="flex flex-col">
      <Input
        type="file"
        id={name}
        name={name}
        required={required}
        multiple
        accept=".pdb"
        onChange={onChange}
      />
      <ol className="list-decimal list-inside">
        {files.map((file) => (
          <li key={file.name}>
            <MolViewerDialog structure={file} label={file.name} />
          </li>
        ))}
      </ol>
    </div>
  );
}
