import type { SerializeFrom } from "@remix-run/node";
import { CompletedJobs } from "~/bartender-client/types";
import { ListLogFiles } from "../browse/ListLogFiles";
import type { JobModelDTO } from "~/bartender-client/types";
import { JobName } from "./JobName";
import { prefix } from "~/prefix";

interface Props {
  job: SerializeFrom<JobModelDTO>;
  lastStateCheckOn?: string;
}

export function JobStatus({ job, lastStateCheckOn }: Props) {
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
      {lastStateCheckOn ? (
        <p>Last checked on: {new Date(lastStateCheckOn).toUTCString()}</p>
      ) : null}
      {CompletedJobs.has(job.state) && (
        <>
          <details open={job.state === "error"}>
            <summary className="cursor-pointer">Logs</summary>
            <ListLogFiles jobid={job.id} ok={job.state === "ok"} />
          </details>
          <a href={`${prefix}jobs/${job.id}/zip`}>&#128230; Download archive</a>
        </>
      )}
    </>
  );
}
