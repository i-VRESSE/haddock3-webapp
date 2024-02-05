import { useWorkflow } from "@i-vresse/wb-core/dist/store";
import { Button } from "~/components/ui/button";

export const WorkflowDownloadButton = (): JSX.Element => {
  const { save } = useWorkflow();

  return (
    <Button
      variant="secondary"
      onClick={save}
      className="text-primary hover:bg-gray-200"
    >
      Download archive
    </Button>
  );
};
