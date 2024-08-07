import { NGLComponent, NGLStage } from "@i-vresse/haddock3-ui";
import { useState } from "react";

import { Button } from "~/components/ui/button";

import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export function MolViewerDialog({ structure }: { structure?: File }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!structure}
          title="Preview in 3D"
          variant="ghost"
          size="icon"
        >
          👁
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
