import {
  CatalogPanel,
  NodePanel,
  WorkflowPanel,
  WorkflowUploadButton,
  Wrapper,
} from "@i-vresse/wb-core";
import {
  useCatalog,
  useSetCatalog,
  useWorkflow,
} from "@i-vresse/wb-core/dist/store";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog";
import { useEffect } from "react";
import { WorkflowSubmitButton } from "./SubmitButton";
import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/routes/builder";
import { WorkflowDownloadButton } from "./DownloadButton";
import { FormActions } from "./FormActions";

const App = () => {
  const { catalog, submitAllowed, archive } = useLoaderData<typeof loader>();
  const setCatalog = useSetCatalog();
  const activetCatalog = useCatalog();
  const { loadWorkflowArchive } = useWorkflow();
  useEffect(() => {
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, [catalog]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (archive !== undefined && activetCatalog.title !== "") {
      // Only load archive once active catalog is set
      loadWorkflowArchive(archive);
    }
  }, [archive, activetCatalog]); // eslint-disable-line react-hooks/exhaustive-deps

  // TODO remove run dir and compute options when submitting
  // TODO upload workflow archive that was create in workflow builder fails
  return (
    <div>
      <div className="page grid h-full w-full gap-2 p-4">
        <div>
          <CatalogPanel></CatalogPanel>
        </div>
        <div>
          <WorkflowPanel>
            <WorkflowUploadButton />
          </WorkflowPanel>
        </div>
        <div>
          <NodePanel />
        </div>
      </div>
      <div className="page sticky inset-x-0 bottom-0 grid h-14">
        <div></div>
        <div role="group" className="btn-group">
          <WorkflowSubmitButton submitAllowed={submitAllowed} />
          <WorkflowDownloadButton />
        </div>
        <FormActions />
      </div>
    </div>
  );
};

export const Haddock3WorkflowBuilder = () => {
  return (
    <Wrapper>
      <App />
    </Wrapper>
  );
};
