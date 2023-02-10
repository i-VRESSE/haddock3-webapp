import {
  CatalogPanel,
  FormActions,
  GridArea,
  NodePanel,
  WorkflowPanel,
  Wrapper,
} from "@i-vresse/wb-core";
import { useSetCatalog } from "@i-vresse/wb-core/dist/store";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog";
import { useEffect } from "react";
import { WorkflowSubmitButton } from "./SubmitButton";

const App = () => {
  const setCatalog = useSetCatalog();
  useEffect(() => {
    const catalog = {
      title: "Some title",
      global: {
        schema: {
          type: "object",
          properties: {
            parameterY: {
              type: "string",
            },
          },
        },
        uiSchema: {},
      },
      categories: [
        {
          name: "cat1",
          description: "First category",
        },
      ],
      nodes: [
        {
          category: "cat1",
          description: "Description of somenode",
          id: "somenode",
          label: "Some node",
          schema: {
            type: "object",
            properties: {
              parameterX: {
                type: "string",
              },
            },
          },
          uiSchema: {},
        },
      ],
      examples: {},
    };
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, [setCatalog]);

  function submit() {

  }
  return (
    <div className='page'>
        <GridArea area='catalog'>
          <CatalogPanel>
          </CatalogPanel>
        </GridArea>
        <GridArea area='workflow'>
          <WorkflowPanel />
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

