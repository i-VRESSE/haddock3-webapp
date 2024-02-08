import {
  useCatalog,
  useFiles,
  useWorkflow,
} from "@i-vresse/wb-core/dist/store";
import { catalog2tomlSchemas } from "@i-vresse/wb-core/dist/toml.js";
import { createZip } from "@i-vresse/wb-core/dist/archive";
import { useSubmit } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

export const WorkflowSubmitButton = ({
  submitAllowed,
}: {
  submitAllowed: boolean;
}): JSX.Element => {
  const submit = useSubmit();
  const { nodes, global } = useWorkflow();
  const files = useFiles();
  const catalog = useCatalog();

  const submitworkflow = async (): Promise<void> => {
    const tomlSchemas = catalog2tomlSchemas(catalog);
    const zip: Blob = await createZip(nodes, global, files, tomlSchemas);
    const formData = new FormData();
    formData.set("upload", zip);

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };
  if (submitAllowed) {
    return <Button onClick={submitworkflow}>Submit</Button>;
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button disabled>Submit</Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You don't have permission to submit. Please login and make sure you have the right expertise level.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
