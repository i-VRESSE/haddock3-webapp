import { useEffect, useState } from "react";
import { useWorkflow } from "@i-vresse/wb-core/dist/store";
import {
  getBuilderData,
  openDB,
  dbName,
  dbVersion,
  getWorkflowZip,
  deleteWorkflowZip,
  deleteBuilderData,
} from "./indexedDB";

type UseIndexedDbProps = {
  activeCatalogTitle: string;
};

export default function useIndexedDb({
  activeCatalogTitle,
}: UseIndexedDbProps) {
  const [loading, setLoading] = useState(true);
  const { loadWorkflowArchive } = useWorkflow();

  useEffect(() => {
    // use abort flag to prevent status update on removed process
    let abort = false;
    // async get data from indexedDB
    async function getIDBData() {
      try {
        setLoading(true);
        // open haddock3 indexed DB
        const db = await openDB({
          dbName,
          dbVersion,
        });
        // first try to load zips (this is scenario example)
        if (db.objectStoreNames.contains("zips") === true) {
          // get zip data
          const zip = await getWorkflowZip(db);
          if (zip) {
            // create url from blob
            const url = URL.createObjectURL(zip);
            // check abort
            if (abort) return;
            // load data into form
            await loadWorkflowArchive(url);
            // remove url
            URL.revokeObjectURL(url);
            // delete workflow zip from database after use
            await deleteWorkflowZip(db);
            // exit hook because we can load only one workflow at the time
            return;
          }
        }
        // second if no scenario try for builder saved data
        if (db.objectStoreNames.contains("builder") === true) {
          // get zip data
          const zip = await getBuilderData(db);
          // debugger
          if (
            // there is zip file
            zip &&
            // and the user wants to load saved configuration
            confirm("Found unfinished workflow. Do you want to use it?") ===
              true
          ) {
            // create url from blob
            const url = URL.createObjectURL(zip);
            // check abort
            if (abort) return;
            // load data into form
            await loadWorkflowArchive(url);
            // remove url
            URL.revokeObjectURL(url);
            // delete loaded data
            await deleteBuilderData(db);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        // debugger
        console.error(`Failed to load data from indexedDB. ${e?.message}`);
      } finally {
        // flag we are done
        setLoading(false);
      }
    }

    if (activeCatalogTitle) {
      // get scenario or builder data from indexedDB
      getIDBData();
    }

    // on cleanup we set abort to true to stop all pending operations
    return () => {
      abort = true;
    };

    // ignore loadWorkflowArchive deps warning to avoid endless loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatalogTitle]);

  return {
    loading,
  };
}
