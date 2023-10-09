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
  reclustrmsd,
} from "~/tools/reclustrmsd.server";
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
  return json({
    moduleIndex,
    moduleName,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
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

export default function ReclusterPage() {
  const {
    moduleIndex,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Form method="post" action="?">
        <h2 className="text-2xl">Recluster of module {moduleIndex}</h2>
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
            <label htmlFor="threshold" className="block">
              Cluster population threshold
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
          {/* 
          TODO show history, and allow to switch to old result 
          Reset button is not possible, due to write-once job dir
          */}
          <a href=".." className=" btn-outline btn btn-sm">
            Back
          </a>
        </div>
        <ToolHistory
          interactivness={interactivness}
          maxInteractivness={maxInteractivness}
        />
      </Form>
      <div>
        {/* TODO make into component and add structure viewer with contacts (*.con file) */}
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Model</th>
              <th>Score</th>
              <th>Cluster id</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((cluster) => (
              <tr key={cluster.rank}>
                <td>{cluster.rank}</td>
                <td>{cluster.model_name}</td>
                <td>{cluster.score}</td>
                <td>{cluster.cluster_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
