import { getParamsCfg } from "~/models/job.server";
import { getClusterTsv } from "./recluster.server";
import { object, number, coerce, finite, type Output, integer } from "valibot";
import { createClient } from "~/models/config.server";

export const Schema = object({
  clust_cutoff: coerce(number([finite()]), Number),
  strictness: coerce(number([finite()]), Number),
  min_population: coerce(number([integer()]), Number),
});
export type Schema = Output<typeof Schema>;

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
    }
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
