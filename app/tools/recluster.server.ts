import { buildPath, getJobfile } from "~/models/job.server";
import { parseTsv } from "~/models/tsv";

export const parseClusterTsv = (body: string) =>
  parseTsv<RawClusterRow>(body, false, true);

export interface RawClusterRow {
  rank: number;
  model_name: string;
  score: number;
  cluster_id: number | "-";
}

export interface ClusterRow extends RawClusterRow {
  model_path: string;
}

interface IOJsonFile {
  input: {
    file_name: string;
    rel_path: {
      "py/reduce": [
        { "py/type": string },
        {
          "py/tuple": string[];
        },
      ];
    };
  }[];
}

async function getIoJson({
  jobid,
  moduleIndex,
  moduleName,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  moduleIndex: number;
  moduleName: string;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}): Promise<IOJsonFile> {
  const path = buildPath({
    moduleIndex,
    moduleName,
    isInteractive,
    suffix: "io.json",
    moduleIndexPadding,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  if (!response.ok) {
    throw new Error(`Could not get ${path}`);
  }
  // The JSON strings contains NaN which is not valid JSON for nodejs
  const text = await response.text();
  return JSON.parse(text.replace(/NaN/g, "null"));
}

function appendPath(
  rows: RawClusterRow[],
  inputs: IOJsonFile["input"],
): ClusterRow[] {
  const name2path = new Map<string, string>();
  for (const input of inputs) {
    // file_name = rigidbody_73.pdb
    // rel_path = ["..","01_rigidbody","rigidbody_42.pdb"]
    // this component is rendered at /jobs/33/tools/reclustfcc/03
    // to dl = /jobs/33/files/output/01_rigidbody/rigidbody_73.pdb.gz
    const relPathParts = input.rel_path["py/reduce"][1]["py/tuple"];
    relPathParts.shift(); // remove ".."
    const relPath = relPathParts.join("/");
    const modulePath = `../../files/output/${relPath}.gz`;
    name2path.set(input.file_name, modulePath);
  }
  return rows.map((row) => ({
    ...row,
    model_path: name2path.get(row.model_name) ?? row.model_name,
  }));
}

export async function getClusterTsv({
  jobid,
  moduleIndex,
  moduleName,
  filename,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  moduleIndex: number;
  moduleName: string;
  filename: string;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}) {
  const path = buildPath({
    moduleIndex,
    moduleName,
    isInteractive,
    suffix: filename,
    moduleIndexPadding,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  if (!response.ok) {
    throw new Error(`Could not get ${path}`);
  }
  const body = await response.text();
  const rows = parseClusterTsv(body);

  const ioJson = await getIoJson({
    jobid,
    moduleIndex,
    moduleName,
    bartenderToken,
    moduleIndexPadding,
    isInteractive: false,
  });
  return appendPath(rows, ioJson.input);
}
