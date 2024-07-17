export const dbName = "haddock3";
export const dbVersion = 2;

export function deleteDatabase(dbName: string) {
  // delete database
  const delDB = indexedDB.deleteDatabase(dbName);

  delDB.onerror = () => {
    // debugger
    console.error("Error deleting database."), event;
  };

  delDB.onsuccess = () => {
    // debugger
    console.log("Database deleted successfully");
  };
}

type OpenDBProps = {
  dbName: string;
  dbVersion: number;
};

export function openDB({
  dbName,
  dbVersion,
}: OpenDBProps): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    // check if indexedDB is supported
    if (typeof indexedDB === "undefined") {
      rej("IndexedDB is not supported");
    }
    // open haddock3 database
    const dbCnn = indexedDB.open(dbName, dbVersion);
    // listen for upgrade event
    dbCnn.onupgradeneeded = onDbUpgrade;
    // resolve db on success
    dbCnn.onsuccess = (e: Event) => {
      // resolve with complete event
      const db = (e.target as IDBOpenDBRequest).result;
      res(db);
    };
    dbCnn.onblocked = () => {
      rej("Opening indexedDB is blocked");
    };
    // reject on error
    dbCnn.onerror = (e) => {
      rej(e);
    };
  });
}

/**
 * Create db structure
 * builder objectStore keeps builder temp data
 * zips objectStore keeps scenarios data
 * @param e
 */
export function onDbUpgrade(e: Event) {
  const db = (e.target as IDBOpenDBRequest).result;
  if (db.objectStoreNames.contains("builder") === false) {
    // create builder object
    db.createObjectStore("builder");
  }
  if (db.objectStoreNames.contains("zips") === false) {
    // create zips object store
    db.createObjectStore("zips");
  }
}

export function getBuilderData(db: IDBDatabase): Promise<Blob> {
  return new Promise((res, rej) => {
    // setup builder transaction
    const builder = db
      .transaction(["builder"], "readonly")
      .objectStore("builder");

    // get builder.zip
    const request = builder.get("builder.zip");

    // resolve onsuccess
    request.onsuccess = (e: Event) => {
      const zip = (e.target as IDBRequest<Blob>).result;
      res(zip);
    };

    // reject onerror
    request.onerror = () => {
      rej("Failed to load builder data from indexed DB");
    };
  });
}

export function deleteBuilderData(db: IDBDatabase) {
  return new Promise((res, rej) => {
    const builder = db
      .transaction(["builder"], "readwrite")
      .objectStore("builder");

    const request = builder.delete("builder.zip");

    request.onsuccess = () => {
      res("OK");
    };

    request.onerror = () => {
      rej("Failed to delete builder.zip");
    };
  });
}

export function getWorkflowZip(db: IDBDatabase): Promise<Blob> {
  return new Promise((res, rej) => {
    // setup scenarios transaction
    const zips = db.transaction(["zips"], "readonly").objectStore("zips");

    // get workflow.zip
    const request = zips.get("workflow.zip");

    // resolve onsuccess
    request.onsuccess = (e: Event) => {
      const zip = (e.target as IDBRequest<Blob>).result;
      res(zip);
    };

    // reject onerror
    request.onerror = () => {
      rej("Failed to load workflow data from indexed DB");
    };
  });
}

export function deleteWorkflowZip(db: IDBDatabase) {
  return new Promise((res, rej) => {
    const zips = db.transaction(["zips"], "readwrite").objectStore("zips");

    const request = zips.delete("workflow.zip");

    request.onsuccess = () => {
      res("OK");
    };

    request.onerror = () => {
      rej("Failed to delete workflow.zip");
    };
  });
}

type SaveBuilderProps = {
  db: IDBDatabase;
  zip: Blob;
};

export function saveBuilderData({
  db,
  zip,
}: SaveBuilderProps): Promise<string> {
  return new Promise((res, rej) => {
    // setup builder transaction
    const builder = db
      .transaction(["builder"], "readwrite")
      .objectStore("builder");

    // save builder.zip
    const request = builder.put(zip, "builder.zip");

    // resolve onsuccess
    request.onsuccess = () => {
      res("OK");
    };

    // reject onerror
    request.onerror = () => {
      rej("Failed to load builder data from indexed DB");
    };
  });
}

/**
 * This method can be used to remove any temp data saved without any error messaging on fail.
 */
export function removeBuilderData() {
  openDB({ dbName, dbVersion })
    .then((db) => {
      return deleteBuilderData(db);
    })
    .then(() => {
      console.info("Builder data removed");
    })
    .catch(() => {
      console.info("Failed to remove builder data");
    });
}
