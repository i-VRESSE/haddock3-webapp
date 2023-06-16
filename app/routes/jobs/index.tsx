import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/token.server";
import { getJobs } from "~/models/job.server";

export const loader = async ({ request }: LoaderArgs) => {
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }
  const jobs = await getJobs(access_token);
  return json({ jobs });
};

export default function JobPage() {
  const { jobs } = useLoaderData<typeof loader>();
  return (
    <main>
      <table className="table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Name</th>
            <th>Created on</th>
            <th>Updated on</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </td>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.state}</Link>
              </td>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.name}</Link>
              </td>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.createdOn}</Link>
              </td>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.updatedOn}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
