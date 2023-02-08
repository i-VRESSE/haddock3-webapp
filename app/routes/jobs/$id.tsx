import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/cookies.server";
import { applicationByName } from "~/models/applicaton.server";
import { getJobById } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const job_id = params.id || "";
    const access_token = await getAccessToken(request)
    if (access_token === undefined) {
      throw new Error('Unauthenticated')
    }
    const job = await getJobById(parseInt(job_id), access_token);
    const app = await applicationByName(job.application)
    return json({ job, app });
  };

export default function JobPage() {
    const { job,app } = useLoaderData<typeof loader>();
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
                <p><a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stdout`}>Stdout</a></p>
                <p><a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/stderr`}>Stderr</a></p>
                <p><a target="_blank" rel="noreferrer" href={`/jobs/${job.id}/files/${app.config}`}>{app.config}</a></p>
        </main>
    )
}