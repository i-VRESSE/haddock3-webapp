import { useEffect } from "react";
import {
  useCatalog,
  useFiles,
  useWorkflow,
} from "@i-vresse/wb-core/dist/store";
import { catalog2tomlSchemas } from "@i-vresse/wb-core/dist/toml.js";
import { createZip } from "@i-vresse/wb-core/dist/archive";
import { openDB, dbName, dbVersion, saveBuilderData } from "./indexedDB";

/**
 * Hook to save builder data when user navigates away from the specific page.
 * @param pathname the value of location.pathname that triggers saving when changed
 * @returns routeToSave {string} as confirmation of route to "guard"
 */
export default function useSaveOnLeave(pathname: string) {
  const { nodes, global } = useWorkflow();
  const files = useFiles();
  const catalog = useCatalog();

  useEffect(() => {
    // on clean up
    return () => {
      // we should save builder content only
      // after route change and if there is something to save
      if (
        // we navigate await from the routeToSave
        pathname !== location.pathname &&
        // and at least one node and one file are present
        nodes.length > 0 &&
        Object.keys(files).length > 0
      ) {
        console.group("useSaveOnLeave");
        console.log(pathname, "...CLOSING");
        // console.log("nodes...", nodes)
        // console.log("global...", global)
        // console.log("files...", files)
        console.log("location...", location.pathname);
        // console.log("pathname...", pathname)
        console.groupEnd();

        // create toml for zip
        const tomlSchemas = catalog2tomlSchemas(catalog);

        // open indexedDB and createZip in parallel
        Promise.all([
          openDB({ dbName, dbVersion }),
          createZip(nodes, global, files, tomlSchemas),
        ])
          .then(([db, zip]) => {
            // debugger
            return saveBuilderData({ db, zip });
          })
          .then((status) => {
            // debugger
            // log status: OK
            console.log("useSaveOnLeave...", status);
          })
          .catch((e) => {
            // debugger
            console.error("useSaveOnLeave...FAILED:", e);
          });
      }
    };
  }, [pathname, nodes, global, files, catalog]);

  return pathname;
}
