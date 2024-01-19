import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender_token.server";
import { jobIdFromParams, getJobById } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import type { CaprievalPlotlyProps } from "~/models/caprieval.server";
import {
  getCaprievalModuleInfo,
  getScores,
  getPlotSelection,
  getCaprievalPlots,
} from "~/models/caprieval.server";
// TODO rescore is not used here, so imports should not be from this module
// move to a separate module called ~/model/modules and ~/models/caprieval

export const loader = async ({ params, request }: LoaderArgs) => {
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
    // const [module, maxInteractivness] = [5,0]
    const scores = await getScores({
      jobid,
      module,
      bartenderToken,
      moduleIndexPadding,
    });
    const { scatterSelection, boxSelection } = getPlotSelection(request.url);
    const plotlyPlots = await getCaprievalPlots({
      jobid,
      module,
      bartenderToken,
      moduleIndexPadding,
      scatterSelection,
      boxSelection,
    });
    return json({ job, scores, plotlyPlots });
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
  const { job, scores, plotlyPlots } = useLoaderData<typeof loader>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps;
  const updatedOn = new Date(job.updated_on).toUTCString();
  return (
    <>
      <div className="flex flex-row justify-between pb-4">
        <div>{job.name}</div>
        <div>Completed on {updatedOn}</div>
        <div className="flex flex-row gap-1">
          <Link
            title="Browse"
            to={`/jobs/${job.id}/browse`}
            className="btn-outline btn btn-sm"
          >
            🗀 Browse
          </Link>
          <a
            title="Download archive"
            href={`/jobs/${job.id}/zip`}
            className="btn-outline btn btn-sm"
          >
            &#128230; Download
          </a>
          <Link
            title="Edit"
            to={`/jobs/${job.id}/edit`}
            className="btn-outline btn btn-sm"
          >
            &#128393; Edit
          </Link>
        </div>
      </div>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <CaprievalReport
            scores={scores}
            prefix="files/output/"
            plotlyPlots={plotlyPlotsStripped}
          />
        )}
      </ClientOnly>
    </>
  );
}
