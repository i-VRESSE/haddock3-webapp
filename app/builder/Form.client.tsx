import "./Form.css";
import "./core2.css";

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

  return (
    <>
      <div className="page">
        <CatalogPanel></CatalogPanel>

        <WorkflowPanel>
          <WorkflowUploadButton />
        </WorkflowPanel>

        <NodePanel />
      </div>
      <div className="page sticky inset-x-0 bottom-0 p-4">
        <div></div>
        <div role="group" className="flex flex-row gap-4">
          <WorkflowSubmitButton submitAllowed={submitAllowed} />
          <WorkflowDownloadButton />
        </div>
        <FormActions />
      </div>
    </>
  );
};

export const Haddock3WorkflowBuilder = () => {
  return (
    <Wrapper>
      <App />
    </Wrapper>
  );
};
