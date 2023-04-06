import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/token.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/models/constants";
import { listOutputFiles, getJobById } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { checkAuthenticated } from "~/models/user.server";
import type { DirectoryItem } from "~/bartender-client";
import { ListReportFiles } from "~/components/ListReportFiles";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = parseInt(params.id || "");
  const accessToken = await getAccessToken(request);
  checkAuthenticated(accessToken);
  const job = await getJobById(jobId, accessToken!);
  // TODO check if job belongs to user
  let outputFiles: DirectoryItem | undefined = undefined;
  if (CompletedJobs.has(job.state)) {
    outputFiles = await listOutputFiles(jobId, accessToken!);    
  }
  return json({ job, outputFiles});
};

export default function JobPage() {
  const { job, outputFiles } = useLoaderData<typeof loader>();
  return (
    <main className="flex gap-16">
      <div>
      <p>State: {job.state}</p>
      <p>Created on: {job.createdOn}</p>
      <p>Updated on: {job.updatedOn}</p>
      <p>Name: {job.name}</p>
      </div>
      <div>
      <h2 className="text-xl">Input</h2>
      <ul className="list-disc list-inside">
      <li>
        <a
          target="_blank"
          rel="noreferrer"
          href={`/jobs/${job.id}/files/${WORKFLOW_CONFIG_FILENAME}`}
        >
          {WORKFLOW_CONFIG_FILENAME}
        </a>
      </li>
      {/* TODO list files mentioned in workflow config */}
      </ul>
      </div>
      {CompletedJobs.has(job.state) && (
        <div>
          <h2 className="text-xl">Output</h2>
          <ListReportFiles files={outputFiles!} prefix={`/jobs/${job.id}/files/`}/>
          <ul className="list-disc list-inside">
            <li>
            <a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stdout`}>
              Stdout
            </a>
          </li>
          <li>
            <a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stderr`}>
              Stderr
            </a>
          </li>
          <li>
            <a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/files/output/log`}>
              Haddock3 log
            </a>
          </li>
          </ul>
        </div>
      )}
    </main>
  );
}
