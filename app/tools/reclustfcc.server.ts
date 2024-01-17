import { buildPath, getJobfile } from "~/models/job.server";
import { getClusterTsv } from "./recluster.server";
import { object, number, coerce, finite, type Output } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";
import { createClient } from "~/models/config.server";

export const Schema = object({
  clust_cutoff: coerce(number([finite()]), Number),
  strictness: coerce(number([finite()]), Number),
  min_population: coerce(number([finite()]), Number),
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
  const path = buildPath({
    moduleIndex,
    isInteractive,
    moduleIndexPadding,
    moduleName: "clustfcc",
    suffix: "params.cfg",
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config: any = parseTOML(body, { bigint: false });
  if (!isInteractive) {
    // non-interactive has `[clustfcc]` section
    config = config.clustfcc;
  }
  const params = {
    clust_cutoff: config.clust_cutoff,
    strictness: config.strictness,
    min_population: config.min_population,
  };
  return params;
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
  // Second submit fails with  No such file or directory: 'output/09_clustfcc_interactive/io.json'\n
  // workaround before second submit do `cp output/09_clustfcc/io.json output/09_clustfcc_interactive/io.json`
  // nope still errors gives:
  // returncode: 1,
  // stderr: 'Traceback (most recent call last):\n' +
  //   '  File "/home/stefanv/git/ivresse/haddock3/venv/bin/haddock3-re", line 33, in <module>\n' +
  //   "    sys.exit(load_entry_point('haddock3', 'console_scripts', 'haddock3-re')())\n" +
  //   '  File "/home/stefanv/git/ivresse/haddock3/src/haddock/clis/cli_re.py", line 57, in maincli\n' +
  //   '    args.func(**cmd)\n' +
  //   '  File "/home/stefanv/git/ivresse/haddock3/src/haddock/re/clustfcc.py", line 110, in reclustfcc\n' +
  //   '    clustfcc_params["fraction_cutoff"] = fraction_cutoff\n' +
  //   "TypeError: 'EmptyPath' object does not support item assignment\n",
  // stdout: '[2023-11-03 13:11:01,180 clustfcc INFO] Reclustering output/09_clustfcc_interactive/\n' +
  //   '[2023-11-03 13:11:02,112 clustfcc INFO] Previous clustering parameters: \n'

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
}
