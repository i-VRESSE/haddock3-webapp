import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBartenderTokenByUser } from "~/bartender_token.server";
import { getJobById, jobIdFromParams } from "~/models/job.server";

import { getUser } from "~/auth.server";
import { JobStatus } from "~/components/JobStatus";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const user = await getUser(request);
  const token = await getBartenderTokenByUser(user);
  const job = await getJobById(jobId, token);
  if (job.state === "ok") {
    if (user.preferredExpertiseLevel === "easy") {
      // TODO only redirect when caprieval was run
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
