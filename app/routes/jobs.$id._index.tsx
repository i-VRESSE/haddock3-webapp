import { useEffect } from "react";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";

import { deleteJob, getJobById, jobIdFromParams } from "~/models/job.server";
import { getUser } from "~/auth.server";
import { JobStatus } from "~/components/JobStatus";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";
import { PAGE_REFRESH_RATE_MS } from "~/bartender-client/constants";
import DotsLoader from "~/components/ui/DotsLoader";

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

export const action = async ({ params, request }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return json({ error: "Invalid method" }, { status: 405 });
  }
  const jobId = jobIdFromParams(params);
  const user = await getUser(request);
  const token = await getBartenderTokenByUser(user);
  await deleteJob(jobId, token);
  return null;
};

export default function JobPage() {
  const { job } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    // set interval to refresh job status
    const id = setInterval(() => {
      // reload only if user is on the page/tab
      if (
        document.visibilityState === "visible" &&
        // and job state is not "definitive"
        job.state !== "error" &&
        job.state !== "ok"
      ) {
        console.log("JobPage...REVALIDATE");
        revalidate();
      }
    }, PAGE_REFRESH_RATE_MS);
    return () => {
      // clear interval
      console.log("JobPage...clearInterval...", id);
      if (id) clearInterval(id);
    };
  }, [revalidate, job.state]);

  return (
    <main className="flex gap-16">
      <div>
        <JobStatus job={job} />
        {/* show dots loader indicating we monitor state change */}
        {job.state !== "error" && job.state !== "ok" ? (
          <DotsLoader
            className="py-4"
            state={job.state}
            label="Monitoring state change"
          />
        ) : null}
      </div>
      {/* TODO allow to read input files when job is not completed */}
      {/* TODO allow job to be cancelled, need bartender support first */}
    </main>
  );
}
