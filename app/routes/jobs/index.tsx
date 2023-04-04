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
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </td>
              <td>{job.state}</td>
              <td>{job.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
