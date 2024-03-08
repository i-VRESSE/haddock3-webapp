import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getJobs } from "~/models/job.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const token = await getBartenderToken(request);
  const jobs = await getJobs(token);
  return json({ jobs });
};

export default function JobPage() {
  const { jobs } = useLoaderData<typeof loader>();
  const { submit, state } = useFetcher();

  function deleteJob(id: number): void {
    if (window.confirm("Are you sure you want to delete job?") === false) {
      return;
    }
    submit({}, { method: "delete", action: `/jobs/${id}` });
  }

  // TODO add pagination, usefull for large number of jobs
  return (
    <main>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created on</TableHead>
            <TableHead>Updated on</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <Link to={`/jobs/${job.id}`}>{job.id}</Link>
              </TableCell>
              <TableCell>
                <Link to={`/jobs/${job.id}`}>{job.state}</Link>
              </TableCell>
              <TableCell>
                <Link to={`/jobs/${job.id}`}>{job.name}</Link>
              </TableCell>
              <TableCell>
                <Link to={`/jobs/${job.id}`}>
                  {new Date(job.created_on).toUTCString()}
                </Link>
              </TableCell>
              <TableCell>
                <Link to={`/jobs/${job.id}`}>
                  {new Date(job.updated_on).toUTCString()}
                </Link>
              </TableCell>
              <TableCell>
                <Button
                  disabled={state === "submitting"}
                  onClick={() => deleteJob(job.id)}
                  variant="secondary"
                  title="Delete/cancel job"
                  size="sm"
                >
                  X
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
