import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";
import Plot from "react-plotly.js";

import { getBartenderToken } from "~/bartender_token.server";
import { jobIdFromParams, getJobById, buildPath } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import {
  getWeights,
  getScores,
  WeightsSchema,
  rescore,
  getScatterPlots,
} from "~/tools/rescore.server";
import { RescoreForm } from "~/tools/rescore";
import { moduleInfo } from "~/tools/shared";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const [moduleName, maxInteractivness, moduleIndexPadding] = await moduleInfo(
    jobId,
    moduleIndex,
    token
  );
  const i = new URL(request.url).searchParams.get("i");
  const interactivness = i === null ? maxInteractivness : parseInt(i);
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
  const plotlyScatterPlots = await getScatterPlots(jobId, moduleIndex, 
    interactivness, token, moduleIndexPadding, moduleName);
  return json({
    moduleIndex,
    weights,
    scores,
    interactivness,
    maxInteractivness,
    plotlyScatterPlots,
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
  const [moduleName, maxInteractivness, moduleIndexPadding] = await moduleInfo(
    jobId,
    moduleIndex,
    token
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
  const { moduleIndex, weights, scores, interactivness, maxInteractivness, plotlyScatterPlots } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
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
        {() => <>
          <CaprievalReport scores={scores} prefix="../files/output/" plotlyScatterPlots={plotlyScatterPlots}/>
        </>
        }
      </ClientOnly>

    </>
  );
}
