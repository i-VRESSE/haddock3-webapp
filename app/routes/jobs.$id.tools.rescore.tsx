import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { jobIdFromParams, getJobById, buildPath } from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import {
  step2rescoreModule,
  getWeights,
  getScores,
  WeightsSchema,
  rescore,
} from "~/tools/rescore.server";
import { RescoreForm } from "~/tools/rescore";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const [module, maxInteractivness, moduleIndexPadding] =
    await step2rescoreModule(jobId, token);
  const i = new URL(request.url).searchParams.get("i");
  const interactivness = i === null ? maxInteractivness : parseInt(i);
  const weights = await getWeights(
    jobId,
    module,
    interactivness,
    token,
    moduleIndexPadding
  );
  const scores = await getScores(
    jobId,
    module,
    interactivness,
    token,
    moduleIndexPadding
  );
  return json({ weights, scores, interactivness, maxInteractivness });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const token = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
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
  const [moduleIndex, interactivness, moduleIndexPadding] =
    await step2rescoreModule(jobId, token);
  const capriDir = buildPath({
    moduleIndex,
    moduleName: "caprieval",
    interactivness,
    moduleIndexPadding,
  });
  await rescore(jobId, capriDir, weights, token);
  return json({ errors: { nested: {} } });
};

export default function RescorePage() {
  const { weights, scores, interactivness, maxInteractivness } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <RescoreForm
        weights={weights}
        interactivness={interactivness}
        maxInteractivness={maxInteractivness}
        errors={actionData?.errors}
      />
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <CaprievalReport scores={scores} prefix="../files/output/" />}
      </ClientOnly>
    </>
  );
}
