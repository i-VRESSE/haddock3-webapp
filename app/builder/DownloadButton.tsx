import { useWorkflow } from "@i-vresse/wb-core/dist/store";
import { Download } from "lucide-react";
import { Button } from "~/components/ui/button";

export const WorkflowDownloadButton = (): JSX.Element => {
  const { save } = useWorkflow();

  return (
    <Button variant="ghost" onClick={save} title="Download">
      <Download />
    </Button>
  );
};
