import { buildPath, getJobfile } from "~/models/job.server";
import { parseTsv } from "~/models/tsv";

export const parseClusterTsv = (body: string) =>
  parseTsv<ClusterRow>(body, false, true);

export interface ClusterRow {
  rank: number;
  model_name: string;
  score: number;
  cluster_id: number | "-";
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
  const body = await response.text();
  const rows = await parseClusterTsv(body);
  return rows;
}
