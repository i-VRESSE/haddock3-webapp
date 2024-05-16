import { useWorkflow } from "@i-vresse/wb-core/dist/store";
import { Trash } from "lucide-react";
import { Button } from "~/components/ui/button";

export const ClearButton = (): JSX.Element => {
  const { clear } = useWorkflow();

  return (
    <Button variant="ghost" onClick={clear} title="Clear">
      <Trash />
    </Button>
  );
};
