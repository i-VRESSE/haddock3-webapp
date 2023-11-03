import { ClusterTable } from "~/tools/reclust";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { ErrorMessages } from "~/components/ErrorMessages";
import { ToolHistory } from "~/components/ToolHistory";
import { jobIdFromParams, getJobById, buildPath } from "~/models/job.server";
import {
  Schema,
  getClusters,
  getParams,
  reclustfcc,
} from "~/tools/reclustfcc.server";
import { moduleInfo } from "~/tools/shared";
import { CompletedJobs } from "~/utils";
import { getScores } from "~/tools/rescore.server";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { ReWarning } from "~/components/ReWarning";

// TODO use the descriptions once they are filled
// const fieldDescriptions = getModuleDescriptions(`clustfcc`, [
//   "fraction_cutoff",
//   "strictness",
//   "threshold",
// ])

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
  const defaultValues = await getParams(
    jobId,
    moduleIndex,
    interactivness,
    token,
    moduleIndexPadding
  );
  const clusters = await getClusters(
    jobId,
    moduleIndex,
    interactivness,
    token,
    moduleIndexPadding
  );
  let scores;
  try {
    scores = await getScores(
      jobId,
      moduleIndex,
      interactivness,
      token,
      moduleIndexPadding,
      "clustfcc"
    );
  } catch (error) {
    // Scores where not found
    scores = undefined;
  }

  return json({
    moduleIndex,
    moduleName,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
    scores,
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
  const result = safeParse(Schema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const clustfccParams = result.data;
  const interactivness = await moduleInfo(jobId, moduleIndex, token);
  const clustccDir = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    interactivness: 0,
    moduleIndexPadding: interactivness[2],
  });
  await reclustfcc(jobId, clustccDir, clustfccParams, token);
  return json({ errors: { nested: {} } });
};

export default function ReclusterPage() {
  const {
    moduleIndex,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
    scores,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Form method="post" action="?">
        <h2 className="text-2xl">Recluster of module {moduleIndex}</h2>
        <ReWarning title="Reclustering" />
        <div className="flex flex-row gap-4">
          {/* key is used to force React to re-render the component
          when the weights changes */}
          <div
            key={"clust_cutoff" + defaultValues.clust_cutoff}
            title="fraction of common contacts to not be considered a singleton model."
          >
            <label htmlFor="fraction_cutoff" className="block">
              Cluster cutoff
            </label>
            <input
              type="text"
              name="clust_cutoff"
              id="clust_cutoff"
              defaultValue={defaultValues.clust_cutoff}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="clust_cutoff" errors={actionData?.errors} />
          </div>
          <div
            key={"strictness" + defaultValues.strictness}
            title="fraction of common contacts to be considered to be part of the same cluster"
          >
            <label htmlFor="strictness" className="block">
              Strictness
            </label>
            <input
              type="text"
              name="strictness"
              id="strictness"
              defaultValue={defaultValues.strictness}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="strictness" errors={actionData?.errors} />
          </div>
          <div key={"min_population" + defaultValues.min_population}>
            <label htmlFor="threshold" className="block">
              Minimum cluster population
            </label>
            <input
              type="text"
              name="min_population"
              id="min_population"
              defaultValue={defaultValues.min_population}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="min_population" errors={actionData?.errors} />
          </div>
        </div>
        <div className="flex flex-row gap-2 p-2">
          <button type="submit" className="btn btn-primary btn-sm">
            Recluster
          </button>
          <a href="../.." className=" btn-outline btn btn-sm">
            Back
          </a>
        </div>
        <ToolHistory
          interactivness={interactivness}
          maxInteractivness={maxInteractivness}
        />
      </Form>
      <div>
        <details open={true}>
          <summary>Clusters</summary>
          <ClusterTable clusters={clusters} />
        </details>
        {scores && (
          <details open={true}>
            <summary>Capri evaluation</summary>
            <ClientOnly fallback={<p>Loading...</p>}>
              {() => (
                <CaprievalReport scores={scores} prefix="../files/output/" />
              )}
            </ClientOnly>
          </details>
        )}
      </div>
    </>
  );
}
