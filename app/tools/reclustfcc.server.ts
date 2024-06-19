import { getParamsCfg } from "~/models/job.server";
import { getClusterTsv } from "./recluster.server";
import {
  object,
  number,
  finite,
  type InferOutput,
  pipe,
  transform,
  integer,
  union,
  string,
} from "valibot";
import { createClient } from "~/models/config.server";

export const Schema = object({
  clust_cutoff: pipe(union([string(), number()]), transform(Number), finite()),
  strictness: pipe(union([string(), number()]), transform(Number), finite()),
  min_population: pipe(
    union([string(), number()]),
    transform(Number),
    integer(),
  ),
});
export type Schema = InferOutput<typeof Schema>;

export async function getParams({
  jobid,
  moduleIndex,
  bartenderToken,
  moduleIndexPadding,
  isInteractive = false,
}: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}): Promise<Schema> {
  return await getParamsCfg({
    jobid,
    moduleIndex,
    bartenderToken,
    moduleIndexPadding,
    moduleName: "clustfcc",
    schema: Schema,
    isInteractive,
  });
}

export async function getClusters(options: {
  jobid: number;
  moduleIndex: number;
  bartenderToken: string;
  moduleIndexPadding: number;
  isInteractive: boolean;
}) {
  return getClusterTsv({
    ...options,
    moduleName: "clustfcc",
    filename: "clustfcc.tsv",
  });
}

export async function reclustfcc({
  jobid,
  moduleIndex,
  clustfccDir,
  params,
  bartenderToken,
}: {
  jobid: number;
  moduleIndex: number;
  clustfccDir: string;
  params: Schema;
  bartenderToken: string;
}) {
  const body = {
    clustfcc_dir: clustfccDir,
    module_nr: moduleIndex,
    ...params,
  };
  const client = createClient(bartenderToken);
  const { data, error } = await client.POST(
    "/api/job/{jobid}/interactive/reclustfcc",
    {
      params: {
        path: {
          jobid,
        },
      },
      body,
    },
  );
  if (error) {
    throw error;
  }
  if (data.returncode !== 0) {
    console.error(data);
    throw new Error(`reclustfcc failed with return code ${data.returncode}`);
  }
  // TODO remove this when https://github.com/haddocking/haddock3/issues/821 is fixed
  if (data.stdout.includes("cancelling unsuccesful analysis")) {
    console.error(data);
    throw new Error("unsuccesful analysis");
  }
}
