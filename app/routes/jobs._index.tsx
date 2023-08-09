import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBartenderToken } from "~/bartender_token.server";
import { getJobs } from "~/models/job.server";

export const loader = async ({ request }: LoaderArgs) => {
  const token = await getBartenderToken(request);
  const jobs = await getJobs(token);
  return json({ jobs });
};

export default function JobPage() {
  const { jobs } = useLoaderData<typeof loader>();
  // TODO add pagination
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
