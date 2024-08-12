import "./Form.css";
import "./core2.css";

import {
  CatalogPanel,
  NodePanel,
  WorkflowPanel,
  Wrapper,
} from "@i-vresse/wb-core";
import {
  useCatalog,
  useSetCatalog,
  useWorkflow,
} from "@i-vresse/wb-core/dist/store";
import { prepareCatalog } from "@i-vresse/wb-core/dist/catalog";
import { useEffect } from "react";
import { SubmitButton } from "./SubmitButton";
import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/routes/builder";
import { DownloadButton } from "./DownloadButton";
import { UploadButton } from "./UploadButton";
import { ClearButton } from "./ClearButton";
import useIndexedDb from "./useIndexedDb";
import useSaveOnLeave from "./useSaveOnLeave";

const App = () => {
  // save builder data when users leaves the route
  useSaveOnLeave(location.pathname);
  const { catalog, submitAllowed, archive } = useLoaderData<typeof loader>();
  const setCatalog = useSetCatalog();
  const activeCatalog = useCatalog();
  const { loadWorkflowArchive } = useWorkflow();
  const { loading } = useIndexedDb({ activeCatalogTitle: activeCatalog.title });

  useEffect(() => {
    // On mount configure catalog
    setCatalog(prepareCatalog(catalog));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  useEffect(() => {
    if (archive !== undefined && activeCatalog.title !== "") {
      // Only load archive once active catalog is set
      loadWorkflowArchive(archive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archive, activeCatalog]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="page">
        <CatalogPanel></CatalogPanel>

        <WorkflowPanel>
          <SubmitButton submitAllowed={submitAllowed} />
          <UploadButton />
          <DownloadButton />
          <ClearButton />
        </WorkflowPanel>
        <NodePanel />
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
