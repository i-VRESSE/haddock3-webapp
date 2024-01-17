import type { Weights } from "~/models/caprieval.server";
import { createClient } from "~/models/config.server";

export async function rescore({
  jobid,
  moduleIndex,
  capriDir,
  weights,
  bartenderToken,
}: {
  jobid: number;
  moduleIndex: number;
  capriDir: string;
  weights: Weights;
  bartenderToken: string;
}) {
  const body = {
    capri_dir: capriDir,
    module_nr: moduleIndex,
    ...weights,
  };
  console.log(body);
  const client = createClient(bartenderToken);
  const { data, error } = await client.POST(
    "/api/job/{jobid}/interactive/rescore",
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
    throw new Error(`rescore failed with return code ${data.returncode}`);
  }
}
