import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/cookies";
import { getJobById } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const job_id = params.id || "";
    const access_token = await getAccessToken(request)
    if (access_token === undefined) {
      throw new Error('Unauthenticated')
    }
    const job = await getJobById(parseInt(job_id), access_token);
    return json({ job });
  };

export default function JobPage() {
    const { job } = useLoaderData<typeof loader>();
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
                <p><Link to={`/jobs/${job.id}/stdout`}>Stdout</Link></p>
        </main>
    )
}