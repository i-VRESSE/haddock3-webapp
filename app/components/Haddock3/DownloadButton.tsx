import { useWorkflow } from "@i-vresse/wb-core/dist/store";

export const WorkflowDownloadButton = (): JSX.Element => {
  const { save } = useWorkflow();

  return (
    <button className="btn-light btn" onClick={save}>
      Download archive
    </button>
  );
};
