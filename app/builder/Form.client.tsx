import "./Form.css";
import "./core2.css";

import {
  CatalogPanel,
  NodePanel,
  WorkflowClear,
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

const App = () => {
  const { catalog, submitAllowed, archive } = useLoaderData<typeof loader>();
  const setCatalog = useSetCatalog();
  const activeCatalog = useCatalog();
  const { loadWorkflowArchive } = useWorkflow();
  useEffect(() => {
    setCatalog(prepareCatalog(catalog)); // On mount configure catalog
  }, [catalog]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (archive !== undefined && activeCatalog.title !== "") {
      // Only load archive once active catalog is set
      loadWorkflowArchive(archive);
    }
  }, [archive, activeCatalog]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // on builder page check for zip in browser storage and loads it
    if (activeCatalog.title === "") {
      return;
    }
    if (typeof indexedDB === "undefined") {
      console.error(
        "IndexedDB not supported, unable to save workflow.zip file.",
      );
      return;
    }
    const open = indexedDB.open("haddock3", 1);
    open.onsuccess = function () {
      const db = open.result;
      try {
        const tx = db.transaction("zips", "readwrite");
        const zips = tx.objectStore("zips");
        const request = zips.get("workflow.zip");
        request.onsuccess = function () {
          const zip: Blob = request.result;
          console.log("zip", zip);
          if (zip === undefined) {
            return;
          }
          const url = URL.createObjectURL(zip);
          loadWorkflowArchive(url)
            .finally(() => {
              URL.revokeObjectURL(url);
            })
            .catch((error) => {
              console.error("Error loading workflow from indexeddb", error);
            });
          // remove zip from indexeddb so next visit to builder page loads nothing
          zips.delete("workflow.zip");
        };
      } catch (error) {
        console.log("Error loading workflow from indexeddb");
        console.error(error);
      }
    };
  }, [activeCatalog]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="page">
        <CatalogPanel></CatalogPanel>

        <WorkflowPanel>
          {/* TODO disable when form invalid */}
          <WorkflowSubmitButton submitAllowed={submitAllowed} />
          {/* TODO replace txt with icon */}
          <WorkflowUploadButton />
          <WorkflowDownloadButton />
          <WorkflowClear/>
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
