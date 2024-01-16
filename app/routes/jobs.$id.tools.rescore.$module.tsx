import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import {
  jobIdFromParams,
  getJobById,
  buildPath,
  listOutputFiles,
} from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { RescoreForm } from "~/tools/rescore";
import type { CaprievalPlotlyProps } from "~/models/caprieval.server";
import {
  getWeights,
  getScores,
  getPlotSelection,
  getCaprievalPlots,
  WeightsSchema,
} from "~/models/caprieval.server";
import { rescore } from "~/tools/rescore.server";
import { moduleInfo } from "~/models/module_utils";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const outputFiles = await listOutputFiles(jobId, token, 1);
  const [moduleName, maxInteractivness, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );
  const i = new URL(request.url).searchParams.get("i");
  const interactivness = i === null ? maxInteractivness : !!i;
  const weights = await getWeights(
    jobId,
    moduleIndex,
    interactivness,
    token,
    moduleIndexPadding
  );
  const scores = await getScores(
    jobId,
    moduleIndex,
    interactivness,
    token,
    moduleIndexPadding,
    moduleName
  );
  const { scatterSelection, boxSelection } = getPlotSelection(request.url);
  const plotlyPlots = await getCaprievalPlots(
    jobId,
    moduleIndex,
    interactivness,
    token,
    moduleIndexPadding,
    scatterSelection,
    boxSelection
  );
  return json({
    moduleIndex,
    weights,
    scores,
    interactivness,
    maxInteractivness,
    plotlyPlots,
  });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const token = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const job = await getJobById(jobId, token);
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
  const outputFiles = await listOutputFiles(jobId, token, 1);
  const [moduleName, maxInteractivness, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );
  const i = new URL(request.url).searchParams.get("i");
  const interactivness = i === null ? maxInteractivness : parseInt(i);
  const capriDir = buildPath({
    moduleIndex,
    moduleName,
    interactivness,
    moduleIndexPadding,
  });
  await rescore(jobId, moduleIndex, capriDir, weights, token);
  return json({ errors: { nested: {} } });
};

export default function RescorePage() {
  const {
    moduleIndex,
    weights,
    scores,
    interactivness,
    maxInteractivness,
    plotlyPlots,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps;
  return (
    <>
      <RescoreForm
        weights={weights}
        interactivness={interactivness}
        maxInteractivness={maxInteractivness}
        moduleIndex={moduleIndex}
        errors={actionData?.errors}
      />
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <>
            <CaprievalReport
              scores={scores}
              prefix="../files/output/"
              plotlyPlots={plotlyPlotsStripped}
            />
          </>
        )}
      </ClientOnly>
    </>
  );
}
