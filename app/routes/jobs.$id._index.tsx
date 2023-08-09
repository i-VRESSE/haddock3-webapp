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
import type { DirectoryItem } from "~/bartender-client";
import { ListLogFiles } from "~/components/ListLogFiles";
import { OutputReport } from "~/components/OutputReport";
import { ListFiles } from "~/components/ListFiles";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token!);
  // TODO check if job belongs to user
  let inputFiles: DirectoryItem | undefined = undefined;
  let outputFiles: DirectoryItem | undefined = undefined;
  if (CompletedJobs.has(job.state)) {
    inputFiles = await listInputFiles(jobId, token!);
    outputFiles = await listOutputFiles(jobId, token!);
  }
  return json({ job, inputFiles, outputFiles });
};

export default function JobPage() {
  const { job, outputFiles, inputFiles } = useLoaderData<typeof loader>();
  return (
    <main className="flex gap-16">
      <div>
        <p>ID: {job.id}</p>
        <p>Name: {job.name}</p>
        <p>
          State: <b>{job.state}</b>
        </p>
        <p>Created on: {job.createdOn}</p>
        <p>Updated on: {job.updatedOn}</p>
        <a href={`/jobs/${job.id}/zip`}>&#128230; Download archive</a>
        {CompletedJobs.has(job.state) && (
          <details>
            <summary className="cursor-pointer">Logs</summary>
            <ListLogFiles jobid={job.id} />
          </details>
        )}
      </div>
      {CompletedJobs.has(job.state) && (
        <>
          {/* TODO allow to read input files when job is not completed */}
          <div>
            <h2 className="text-xl">Input</h2>
            <ListFiles files={inputFiles!} jobid={job.id} />
            <p>
              <a href={`/jobs/${job.id}/input.zip`}>
                &#128230; Download archive
              </a>
            </p>
            <p>
              <a href={`/jobs/${job.id}/edit`}>&#128393; Edit</a>
            </p>
          </div>
          <div>
            <h2 className="text-xl">Output</h2>
            <OutputReport files={outputFiles!} jobid={job.id} />
            <a href={`/jobs/${job.id}/output.zip`}>
              &#128230; Download archive
            </a>
          </div>
        </>
      )}
    </main>
  );
}
