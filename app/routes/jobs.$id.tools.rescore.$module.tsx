import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender-client/token.server";
import {
  jobIdFromParams,
  getJobById,
  buildPath,
  listOutputFiles,
} from "~/models/job.server";
import { CompletedJobs } from "~/bartender-client/types";
import { ClientOnly } from "~/components/ClientOnly";
import { rescore } from "~/tools/rescore.server";
import { moduleInfo } from "~/models/module_utils";
import { shouldShowInteractiveVersion } from "~/tools/shared";
import { RescoreForm } from "~/tools/RescoreForm";
import type { CaprievalPlotlyProps } from "~/caprieval/caprieval.server";
import { getWeights, getScores, getPlotSelection, getCaprievalPlots, WeightsSchema } from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const bartenderToken = await getBartenderToken(request);
  const job = await getJobById(jobId, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [moduleName, hasInteractiveVersion, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );
  const showInteractiveVersion = shouldShowInteractiveVersion(
    request.url,
    hasInteractiveVersion
  );
  const weights = await getWeights({
    jobid: jobId,
    module: moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });
  const scores = await getScores({
    jobid: jobId,
    module: moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
    moduleName,
  });
  const { scatterSelection, boxSelection } = getPlotSelection(request.url);
  const plotlyPlots = await getCaprievalPlots({
    jobid: jobId,
    module: moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
    scatterSelection,
    boxSelection,
  });
  return json({
    moduleIndex,
    weights,
    scores,
    showInteractiveVersion,
    hasInteractiveVersion,
    plotlyPlots,
  });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const bartenderToken = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const job = await getJobById(jobId, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const formData = await request.formData();
  const result = safeParse(WeightsSchema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const weights = result.data;
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [moduleName, , moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );
  const capriDir = buildPath({
    moduleIndex,
    moduleName,
    moduleIndexPadding,
  });
  await rescore({
    jobid: jobId,
    moduleIndex,
    capriDir,
    weights,
    bartenderToken,
  });
  return json({ errors: { nested: {} } });
};

export default function RescorePage() {
  const {
    moduleIndex,
    weights,
    scores,
    showInteractiveVersion,
    hasInteractiveVersion,
    plotlyPlots,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps;
  return (
    <>
      <RescoreForm
        weights={weights}
        showInteractiveVersion={showInteractiveVersion}
        hasInteractiveVersion={hasInteractiveVersion}
        moduleIndex={moduleIndex}
        errors={actionData?.errors}
      />
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <>
            <CaprievalReport
              scores={scores}
              prefix="../../files/output/"
              plotlyPlots={plotlyPlotsStripped}
            />
          </>
        )}
      </ClientOnly>
    </>
  );
}
