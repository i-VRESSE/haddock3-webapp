import type { SerializeFrom } from "@remix-run/node";
import type { JobModelDTO } from "~/bartender-client";
import { CompletedJobs } from "~/utils";
import { ListLogFiles } from "./ListLogFiles";

interface Props {
  job: SerializeFrom<JobModelDTO>;
}

export function JobStatus({ job }: Props) {
  return (
    <>
      <p>ID: {job.id}</p>
      <p>Name: {job.name}</p>
      <p>
        State: <b>{job.state}</b>
      </p>
      {/* TODO nicer format datetime then iso8601 */}
      <p>Created on: {job.createdOn}</p>
      <p>Updated on: {job.updatedOn}</p>
      {CompletedJobs.has(job.state) && (
        <>
          <a href={`/jobs/${job.id}/zip`}>&#128230; Download archive</a>
          <details>
            <summary className="cursor-pointer">Logs</summary>
            <ListLogFiles jobid={job.id} />
          </details>
        </>
      )}
    </>
  );
}
