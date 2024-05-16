import { useWorkflow } from "@i-vresse/wb-core/dist/store";
import { Download } from "lucide-react";
import { Button } from "~/components/ui/button";

export const DownloadButton = (): JSX.Element => {
  const { save } = useWorkflow();

  return (
    <Button variant="ghost" onClick={save} title="Download an archive">
      <Download />
    </Button>
  );
};
