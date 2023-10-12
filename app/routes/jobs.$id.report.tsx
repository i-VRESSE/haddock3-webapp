import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender_token.server";
<<<<<<< HEAD
import {
  jobIdFromParams,
  getJobById,
  isOutputCleaned,
} from "~/models/job.server";
=======
import { jobIdFromParams, getJobById } from "~/models/job.server";
>>>>>>> parent of 4cb98c5 (Fix structure link in report)
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { step2rescoreModule, getScores } from "~/tools/rescore.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const [module, maxInteractivness, pad] = await step2rescoreModule(
    jobId,
    token
  );
  // const [module, maxInteractivness] = [5,0]
  const scores = await getScores(jobId, module, maxInteractivness, token, pad);
  return json({ job, scores });
};

export default function RescorePage() {
  const { job, scores } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex flex-row justify-between">
        <div>{job.name}</div>
        <div className="flex flex-row gap-1">
          <a
            title="Browse"
            href={`/jobs/${job.id}/browse`}
            className="btn-outline btn btn-sm"
          >
            🗀 Browse
          </a>
          <a
            title="Download archive"
            href={`/jobs/${job.id}/zip`}
            className="btn-outline btn btn-sm"
          >
            &#128230; Download
          </a>
          <a
            title="Edit"
            href={`/jobs/${job.id}/edit`}
            className="btn-outline btn btn-sm"
          >
            &#128393; Edit
          </a>
        </div>
      </div>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <CaprievalReport scores={scores} prefix="files/output/" />}
      </ClientOnly>
    </>
  );
}
