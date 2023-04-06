import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/token.server";
import { applicationByName } from "~/models/applicaton.server";
import { getJobById } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { checkAuthenticated } from "~/models/user.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const job_id = params.id || "";
  const accessToken = await getAccessToken(request);
  checkAuthenticated(accessToken);
  const job = await getJobById(parseInt(job_id), accessToken!);
  // TODO check if job belongs to user
  const app = await applicationByName(job.application);
  return json({ job, app });
};

export default function JobPage() {
  const { job, app } = useLoaderData<typeof loader>();
  return (
    <main>
      <p>
        Application:
        <Link to={`/applications/${job.application}`}>{job.application}</Link>
      </p>
      <p>State: {job.state}</p>
      <p>createdOn: {job.createdOn}</p>
      <p>updatedOn: {job.updatedOn}</p>
      <p>Name: {job.name}</p>
      {CompletedJobs.has(job.state) && (
        <>
          <p>
            <a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stdout`}>
              Stdout
            </a>
          </p>
          <p>
            <a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stderr`}>
              Stderr
            </a>
          </p>
          <p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`/jobs/${job.id}/files/${app.config}`}
            >
              {app.config}
            </a>
          </p>
          <p><a href={`/jobs/${job.id}/result`}>Result</a></p>
        </>
      )}
    </main>
  );
}
