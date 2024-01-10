import { buildPath, getJobfile } from "~/models/job.server";
import { parseClusterTsv } from "./shared";
import { object, number, coerce, finite, type Output } from "valibot";
import { parse as parseTOML } from "@ltd/j-toml";
import { createClient } from "~/models/config.server";

export const Schema = object({
  clust_cutoff: coerce(number([finite()]), Number),
  strictness: coerce(number([finite()]), Number),
  min_population: coerce(number([finite()]), Number),
});
export type Schema = Output<typeof Schema>;

export async function getParams(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
): Promise<Schema> {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    interactivness,
    suffix: "params.cfg",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  let config: any = parseTOML(body, { bigint: false });
  if (!interactivness) {
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

export async function getClusters(
  jobid: number,
  moduleIndex: number,
  interactivness: number,
  bartenderToken: string,
  pad: number
) {
  const path = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    interactivness,
    suffix: "clustfcc.tsv",
    moduleIndexPadding: pad,
  });
  const response = await getJobfile(jobid, path, bartenderToken);
  const body = await response.text();
  const rows = await parseClusterTsv(body);
  return rows;
}

export async function reclustfcc(
  jobid: number,
  clustfccDir: string,
  params: Schema,
  bartenderToken: string
) {
  const body = {
    clustfcc_dir: clustfccDir,
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
