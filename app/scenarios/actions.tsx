import { NavigateFunction, SubmitFunction } from "@remix-run/react";
import { dbName, dbVersion, onDbUpgrade } from "~/builder/indexedDB";
import { Button } from "~/components/ui/button";

export function doUpload(zipPromise: Promise<Blob>, submit: SubmitFunction) {
  zipPromise.then((zip) => {
    // upload archive to server
    const formData = new FormData();
    formData.set("upload", zip);
    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  });
}

export function onRefine(
  zipPromise: Promise<Blob>,
  navigate: NavigateFunction,
) {
  // add zip to browsers indexeddb haddock3 db, zips object store, key workflow.zip
  if (typeof indexedDB === "undefined") {
    console.error("IndexedDB not supported, unable to save workflow.zip file.");
    return;
  }

  const open = indexedDB.open(dbName, dbVersion);
  open.onerror = function () {
    console.error("Error opening indexeddb", open.error);
  };
  open.onupgradeneeded = onDbUpgrade;
  open.onblocked = function () {
    console.error("Error opening indexeddb, blocked");
  };
  open.onsuccess = function () {
    zipPromise.then((zip) => {
      const db = open.result;
      const tx = db.transaction("zips", "readwrite");
      const zips = tx.objectStore("zips");
      const putRequest = zips.put(zip, "workflow.zip");
      putRequest.onerror = function () {
        console.error("Error putting zip in indexeddb", putRequest.error);
      };
      putRequest.onsuccess = function () {
        navigate("/builder");
      };
    });
  };
}

export function onDownload(zipPromise: Promise<Blob>) {
  zipPromise.then((zip) => {
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function handleActionButton(
  event: Event,
  zipPromise: Promise<Blob>,
  navigate: NavigateFunction,
  submit: SubmitFunction,
) {
  const submitEvent = event as SubmitEvent;
  const kind = submitEvent.submitter?.getAttribute("value");
  if (kind === "refine") {
    onRefine(zipPromise, navigate);
  } else if (kind === "download") {
    onDownload(zipPromise);
  } else {
    doUpload(zipPromise, submit);
  }
}

export function ActionButtons() {
  return (
    <div className="mt-4">
      <Button type="submit" name="kind" value="upload">
        Submit
      </Button>
      <Button type="reset" variant="secondary">
        Reset
      </Button>
      <Button type="submit" name="kind" value="refine" variant="secondary">
        Refine in builder
      </Button>
      <Button type="submit" name="kind" value="download" variant="secondary">
        Download workfow.zip
      </Button>
    </div>
  );
}
