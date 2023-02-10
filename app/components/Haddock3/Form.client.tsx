import {
  CatalogPanel,
  FormActions,
  GridArea,
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
import type {loader} from '~/routes/applications/haddock3'

const App = () => {
  const { catalog } = useLoaderData<typeof loader>();
  const setCatalog = useSetCatalog();
  useEffect(() => {
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, [catalog, setCatalog]);

  return (
    <div className='page'>
        <GridArea area='catalog'>
          <CatalogPanel>
          </CatalogPanel>
        </GridArea>
        <GridArea area='workflow'>
          <WorkflowPanel>
          <WorkflowUploadButton />
            </WorkflowPanel>
        </GridArea>
        <GridArea area='node'>
          <NodePanel />
        </GridArea>
        <GridArea className='action-row' area='workflow-actions'>
          <WorkflowSubmitButton/>
        </GridArea>
        <GridArea className='action-row' area='node-actions'>
          <FormActions />
        </GridArea>
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

