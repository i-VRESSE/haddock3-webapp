import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import {
  listOutputFiles,
  getJobById,
  listInputFiles,
  jobIdFromParams,
} from "~/models/job.server";
import { CompletedJobs } from "~/bartender-client/types";
import { JobStatus } from "~/components/JobStatus";
import { ListFiles } from "~/browse/ListFiles";
import { NonModuleOutputFiles } from "~/browse/NonModuleOutputFiles";
import { OutputReport } from "~/browse/OutputReport";
import { getLastCaprievalModule } from "~/caprieval/caprieval.server";


export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const inputFiles = await listInputFiles(jobId, token);
  const outputFiles = await listOutputFiles(jobId, token);
  let hasCaprieval = true;
  try {
    getLastCaprievalModule(outputFiles);
  } catch (error) {
    hasCaprieval = false;
  }

  return json({ job, inputFiles, outputFiles, hasCaprieval });
};

export default function JobPage() {
  const { job, outputFiles, inputFiles, hasCaprieval } =
    useLoaderData<typeof loader>();
  return (
    <main className="flex flex-row gap-16">
      <div>
        <JobStatus job={job} />
        {hasCaprieval && (
          <Link
            className="btn-outline btn btn-lg mt-8"
            to={`/jobs/${job.id}/report`}
          >
            👁 Report
          </Link>
        )}
      </div>
      <div>
        <h2 className="text-2xl">Input</h2>
        <ListFiles files={inputFiles!} jobid={job.id} />
        <p>
          <a href={`/jobs/${job.id}/input.zip`}>&#128230; Download archive</a>
        </p>
        <p>
          <Link to={`/jobs/${job.id}/edit`}>&#128393; Edit</Link>
        </p>
      </div>
      <div>
        <h2 className="text-xl">Module output</h2>
        <OutputReport files={outputFiles!} jobid={job.id} />
        <a href={`/jobs/${job.id}/output.zip`}>&#128230; Download archive</a>
      </div>
      <div>
        <h2 className="text-xl">Other output files</h2>
        <NonModuleOutputFiles files={outputFiles} jobid={job.id} />
      </div>
    </main>
  );
}
