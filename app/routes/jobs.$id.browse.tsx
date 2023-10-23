import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBartenderToken } from "~/bartender_token.server";
import {
  listOutputFiles,
  getJobById,
  listInputFiles,
  jobIdFromParams,
} from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { OutputReport } from "~/components/OutputReport";
import { ListFiles } from "~/components/ListFiles";
import { JobStatus } from "~/components/JobStatus";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const inputFiles = await listInputFiles(jobId, token);
  const outputFiles = await listOutputFiles(jobId, token);

  return json({ job, inputFiles, outputFiles });
};

export default function JobPage() {
  const { job, outputFiles, inputFiles } = useLoaderData<typeof loader>();
  return (
    <main className="flex flex-row gap-16">
      <div>
        <JobStatus job={job} />
        <a className="block pt-8" href={`/jobs/${job.id}/report`}>
          👁 Simplified report
        </a>
      </div>
      <div>
        <h2 className="text-xl">Input</h2>
        <ListFiles files={inputFiles!} jobid={job.id} />
        <p>
          <a href={`/jobs/${job.id}/input.zip`}>&#128230; Download archive</a>
        </p>
        <p>
          <a href={`/jobs/${job.id}/edit`}>&#128393; Edit</a>
        </p>
      </div>
      <div>
        <h2 className="text-xl">Output</h2>
        <OutputReport files={outputFiles!} jobid={job.id} />
        <a href={`/jobs/${job.id}/output.zip`}>&#128230; Download archive</a>
      </div>
    </main>
  );
}
