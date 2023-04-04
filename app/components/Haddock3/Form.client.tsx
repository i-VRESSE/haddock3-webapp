import {
  CatalogPanel,
  NodePanel,
  WorkflowPanel,
  WorkflowUploadButton,
  Wrapper,
} from "@i-vresse/wb-core";
import { useSetCatalog } from "@i-vresse/wb-core/dist/store";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog";
import { useEffect } from "react";
import { WorkflowSubmitButton } from "./SubmitButton";
import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/routes/applications/builder";
import { WorkflowDownloadButton } from "./DownloadButton";
import { FormActions } from "./FormActions";

const App = () => {
  const { catalog, submitAllowed } = useLoaderData<typeof loader>();
  const setCatalog = useSetCatalog();
  useEffect(() => {
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, [catalog, setCatalog]);

  return (
    <div>
      <div className="grid h-full w-full gap-2 p-4 page">
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
      <div className="grid page sticky inset-x-0 bottom-0 h-14">
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
