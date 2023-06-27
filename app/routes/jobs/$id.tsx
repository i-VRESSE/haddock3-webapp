import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/token.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/models/constants";
import { listOutputFiles, getJobById, listInputFiles } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { checkAuthenticated } from "~/models/user.server";
import type { DirectoryItem } from "~/bartender-client";
import { ListLogFiles } from "~/components/ListLogFiles";
import { OutputReport } from "~/components/OutputReport";
import { ListInputFiles } from "~/components/ListInputFiles";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = parseInt(params.id || "");
  const accessToken = await getAccessToken(request);
  checkAuthenticated(accessToken);
  const job = await getJobById(jobId, accessToken!);
  // TODO check if job belongs to user
  let inputFiles: DirectoryItem | undefined = undefined;
  let outputFiles: DirectoryItem | undefined = undefined;
  if (CompletedJobs.has(job.state)) {
    inputFiles = await listInputFiles(jobId, accessToken!);
    outputFiles = await listOutputFiles(jobId, accessToken!);
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
          <details className="cursor-pointer">
            <summary>Logs</summary>
            <ListLogFiles jobid={job.id} />
          </details>
        )}
      </div>
      {CompletedJobs.has(job.state) && (
        <>
          {/* TODO allow to read input files when job is not completed */}
          <div>
            <h2 className="text-xl">Input</h2>
            <ListInputFiles files={inputFiles!} jobid={job.id}/>
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
