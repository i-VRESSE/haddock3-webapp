import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getJobById, jobIdFromParams } from "~/models/job.server";
import { getUser } from "~/auth.server";
import { JobStatus } from "~/components/JobStatus";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobId = jobIdFromParams(params);
  const user = await getUser(request);
  const token = await getBartenderTokenByUser(user);
  const job = await getJobById(jobId, token);
  if (job.state === "ok") {
    if (user.preferredExpertiseLevel === "easy") {
      return redirect("report");
    } else {
      return redirect("browse");
    }
  }

  return json({ job });
};

export default function JobPage() {
  const { job } = useLoaderData<typeof loader>();

  return (
    <main className="flex gap-16">
      <div>
        <JobStatus job={job} />
      </div>
      {/* TODO allow to read input files when job is not completed */}
      {/* TODO allow job to be cancelled, need bartender support first */}
    </main>
  );
}
