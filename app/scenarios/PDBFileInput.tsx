import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Viewer } from "~/scenarios/Viewer.client";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export function PDBFileInput({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [open, setOpen] = useState(false);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setFile(event.target.files?.[0]);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={!file}
            title="Preview in 3D"
            variant="ghost"
            size="icon"
          >
            👁
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2/3 h-2/3 w-2/3">
          {file !== undefined && open && <Viewer file={file} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
