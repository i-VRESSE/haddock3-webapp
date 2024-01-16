import type { SerializeFrom } from "@remix-run/node";
import { CompletedJobs } from "~/utils";
import { ListLogFiles } from "./ListLogFiles";
import type { JobModelDTO } from "~/bartender-client/types";

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
      <p>Created on: {new Date(job.created_on).toUTCString()}</p>
      <p>Updated on: {new Date(job.updated_on).toUTCString()}</p>
      {CompletedJobs.has(job.state) && (
        <>
          <a href={`/jobs/${job.id}/zip`}>&#128230; Download archive</a>
          <details>
            <summary className="cursor-pointer">Logs</summary>
            <ListLogFiles jobid={job.id} ok={job.state === "ok"} />
          </details>
        </>
      )}
    </>
  );
}
