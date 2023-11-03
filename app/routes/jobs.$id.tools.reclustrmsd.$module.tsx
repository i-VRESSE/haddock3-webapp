import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { ClientOnly } from "~/components/ClientOnly";
import { ErrorMessages } from "~/components/ErrorMessages";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { ReWarning } from "~/components/ReWarning";
import { ToolHistory } from "~/components/ToolHistory";
import { jobIdFromParams, getJobById, buildPath } from "~/models/job.server";
import { ClusterTable } from "~/tools/reclust";
import {
  Schema,
  getClusters,
  getParams,
  reclustrmsd,
} from "~/tools/reclustrmsd.server";
import { getScores } from "~/tools/rescore.server";
import { moduleInfo } from "~/tools/shared";
import { CompletedJobs } from "~/utils";

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
      "clustrmsd"
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
    moduleName: "clustrmsd",
    interactivness: interactivness[1],
    moduleIndexPadding: interactivness[2],
  });
  await reclustrmsd(jobId, clustccDir, clustfccParams, token);
  return json({ errors: { nested: {} } });
};

// TODO haddock3-re clustrmsd will get different args, adjust this
const fieldDescriptions = getModuleDescriptions(`clustrmsd`, [
  "criterion",
  "tolerance",
  "threshold",
]);

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
          <div key={"n_clusters" + defaultValues.n_clusters}>
            <label htmlFor="n_clusters" className="block">
              Number of clusters to generate
            </label>
            <input
              type="text"
              name="n_clusters"
              id="n_clusters"
              defaultValue={defaultValues.n_clusters}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="n_clusters" errors={actionData?.errors} />
          </div>
          <div key={"distance" + defaultValues.distance}>
            <label htmlFor="distance" className="block">
              Cutoff distance
            </label>
            <input
              type="text"
              name="distance"
              id="distance"
              defaultValue={defaultValues.distance}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="distance" errors={actionData?.errors} />
          </div>
          <div
            key={"threshold" + defaultValues.threshold}
            title="cluster population threshold."
          >
            <label
              htmlFor="threshold"
              className="block"
              title={fieldDescriptions.threshold.longDescription}
            >
              {fieldDescriptions.threshold.title}
            </label>
            <input
              type="text"
              name="threshold"
              id="threshold"
              defaultValue={defaultValues.threshold}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="threshold" errors={actionData?.errors} />
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
          <details>
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
