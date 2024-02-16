import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { jobIdFromParams, getJobById } from "~/models/job.server";
import { CompletedJobs } from "~/bartender-client/types";
import { ClientOnly } from "~/components/ClientOnly";
import { getBartenderToken } from "~/bartender-client/token.server";
import type { CaprievalData } from "~/caprieval/caprieval.server";
import {
  getCaprievalModuleInfo,
  getPlotSelection,
  getCaprievalData,
  buildBestRankedPath,
} from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";
import { JobName } from "~/components/JobName";
import { buttonVariants } from "~/components/ui/button";
// TODO rescore is not used here, so imports should not be from this module
// move to a separate module called ~/model/modules and ~/models/caprieval

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobid = jobIdFromParams(params);
  const bartenderToken = await getBartenderToken(request);
  const job = await getJobById(jobid, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [module, _, moduleIndexPadding] = await getCaprievalModuleInfo(
      jobid,
      bartenderToken
    );
    const { scatterSelection, boxSelection } = getPlotSelection(request.url);
    const caprievalData = await getCaprievalData({
      jobid,
      module,
      bartenderToken,
      moduleIndexPadding,
      scatterSelection,
      boxSelection,
    });
    const bestRanked = buildBestRankedPath(module, moduleIndexPadding);
    return json({ job, caprievalData, bestRanked });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "No caprieval scores found"
    ) {
      return redirect("browse");
    }
    throw error;
  }
};

export default function RescorePage() {
  const { job, caprievalData, bestRanked } = useLoaderData<typeof loader>();
  // Strip JsonifyObject wrapper
  const caprievalDataCasted = caprievalData as CaprievalData;
  const updatedOn = new Date(job.updated_on).toUTCString();
  return (
    <>
      <div className="flex flex-row justify-between pb-4">
        <div>
          <JobName jobid={job.id} name={job.name} />
        </div>
        <div>Completed on {updatedOn}</div>
        <div className="flex flex-row gap-1">
          <Link
            title="Browse"
            to={`/jobs/${job.id}/browse`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            🗀 Browse
          </Link>
          <Link
            title="Edit workflow"
            to={`/jobs/${job.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            &#128393; Edit
          </Link>
          <a
            title="Download archive of best ranked clusters/structures"
            href={`/jobs/${job.id}/files/${bestRanked}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            🏆 Download best ranked
          </a>
          <a
            title="Download archive of all files"
            href={`/jobs/${job.id}/zip`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            &#128230; Download all
          </a>
        </div>
      </div>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <CaprievalReport {...caprievalDataCasted} />}
      </ClientOnly>
    </>
  );
}
