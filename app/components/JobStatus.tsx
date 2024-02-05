import type { SerializeFrom } from "@remix-run/node";
import { CompletedJobs } from "~/bartender-client/types";
import { ListLogFiles } from "../browse/ListLogFiles";
import type { JobModelDTO } from "~/bartender-client/types";
import { JobName } from "./JobName";

interface Props {
  job: SerializeFrom<JobModelDTO>;
}

export function JobStatus({ job }: Props) {
  return (
    <>
      <p>ID: {job.id}</p>
      <p>
        Name: <JobName jobid={job.id} name={job.name} />
      </p>
      <p>
        State: <b>{job.state}</b>
      </p>
      <p>Created on: {new Date(job.created_on).toUTCString()}</p>
      <p>Updated on: {new Date(job.updated_on).toUTCString()}</p>
      {CompletedJobs.has(job.state) && (
        <>
          <details>
            <summary className="cursor-pointer">Logs</summary>
            <ListLogFiles jobid={job.id} ok={job.state === "ok"} />
          </details>
          <a href={`/jobs/${job.id}/zip`}>&#128230; Download archive</a>
        </>
      )}
    </>
  );
}
