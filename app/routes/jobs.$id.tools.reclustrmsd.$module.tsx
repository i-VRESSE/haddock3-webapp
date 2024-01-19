import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { type ChangeEvent, useState } from "react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender-client/token.server";
import type { CaprievalPlotlyProps } from "~/caprieval/caprieval.server";
import {
  getScores,
  getPlotSelection,
  getCaprievalPlots,
} from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { ClientOnly } from "~/components/ClientOnly";
import { ErrorMessages } from "~/components/ErrorMessages";
import {
  jobIdFromParams,
  getJobById,
  buildPath,
  listOutputFiles,
} from "~/models/job.server";
import { moduleInfo } from "~/models/module_utils";
import { ReClusterTable } from "~/tools/ReClusterTable";
import { ReWarning } from "~/tools/ReWarning";
import { ToolHistory } from "~/tools/ToolHistory";
import {
  Schema,
  getClusters,
  getParams,
  reclustrmsd,
} from "~/tools/reclustrmsd.server";
import { shouldShowInteractiveVersion } from "~/tools/shared";

import { CompletedJobs } from "~/bartender-client/types";

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
  const defaultValues = await getParams({
    jobid: jobId,
    moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });
  const clusters = await getClusters({
    jobid: jobId,
    moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });
  let scores;
  let plotlyPlots;
  if (showInteractiveVersion) {
    scores = await getScores({
      jobid: jobId,
      module: moduleIndex,
      isInteractive: showInteractiveVersion,
      bartenderToken,
      moduleIndexPadding,
      moduleName: "clustrmsd",
    });
    const { scatterSelection, boxSelection } = getPlotSelection(request.url);
    plotlyPlots = await getCaprievalPlots({
      jobid: jobId,
      module: moduleIndex,
      isInteractive: showInteractiveVersion,
      bartenderToken,
      moduleIndexPadding,
      scatterSelection,
      boxSelection,
      moduleName: "clustrmsd",
    });
  }
  return json({
    moduleIndex,
    moduleName,
    defaultValues,
    interactivness: showInteractiveVersion,
    maxInteractivness: hasInteractiveVersion,
    clusters,
    scores,
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
  const result = safeParse(Schema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const clustparams = result.data;
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [, , moduleIndexPadding] = moduleInfo(outputFiles, moduleIndex);
  const clustrmsdDir = buildPath({
    moduleIndex,
    moduleName: "clustrmsd",
    moduleIndexPadding,
  });
  await reclustrmsd({
    jobid: jobId,
    moduleIndex,
    clustrmsdDir,
    params: clustparams,
    bartenderToken,
  });
  return json({ errors: { nested: {} } });
};

const fieldDescriptions = getModuleDescriptions(`clustrmsd`, [
  "criterion",
  "n_clusters",
  "clust_cutoff",
  "min_population",
]);

export default function ReclusterPage() {
  const {
    moduleIndex,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
    scores,
    plotlyPlots,
  } = useLoaderData<typeof loader>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps | undefined;
  const actionData = useActionData<typeof action>();
  const [criterion, setCriterion] = useState(defaultValues.criterion);
  const handleCriterionChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (
      event.target.value === "maxclust" ||
      event.target.value === "distance"
    ) {
      setCriterion(event.target.value);
    }
  };
  const { state } = useNavigation();
  return (
    <>
      <Form method="post" action="?">
        <h2 className="text-2xl">Recluster of module {moduleIndex}</h2>
        <ReWarning title="Reclustering" />
        <div className="flex flex-row gap-4">
          <div
            className="flex flex-col p-2"
            title={fieldDescriptions.criterion.longDescription}
          >
            <label>
              <input
                className="mr-2"
                type="radio"
                name="criterion"
                value="maxclust"
                checked={criterion === "maxclust"}
                onChange={handleCriterionChange}
              />
              By number of desired clusters
            </label>
            <label>
              <input
                className="mr-2"
                type="radio"
                name="criterion"
                value="distance"
                checked={criterion === "distance"}
                onChange={handleCriterionChange}
              />
              By distance
            </label>
          </div>
          {/* key is used to force React to re-render the component
          when the weights changes */}
          {criterion === "maxclust" && (
            <div key={"n_clusters" + defaultValues.n_clusters}>
              <label
                htmlFor="n_clusters"
                className="block"
                title={fieldDescriptions.n_clusters.longDescription}
              >
                {fieldDescriptions.n_clusters.title}
              </label>
              <input
                type="number"
                name="n_clusters"
                id="n_clusters"
                defaultValue={defaultValues.n_clusters}
                className="rounded border-2 p-1"
              />
              <ErrorMessages path="n_clusters" errors={actionData?.errors} />
            </div>
          )}
          {criterion === "distance" && (
            <>
              <div key={"clust_cutoff" + defaultValues.clust_cutoff}>
                <label
                  htmlFor="clust_cutoff"
                  className="block"
                  title={fieldDescriptions.clust_cutoff.longDescription}
                >
                  {fieldDescriptions.clust_cutoff.title}
                </label>
                <input
                  type="text"
                  name="clust_cutoff"
                  id="clust_cutoff"
                  defaultValue={defaultValues.clust_cutoff}
                  className="rounded border-2 p-1"
                />
                <ErrorMessages
                  path="clust_cutoff"
                  errors={actionData?.errors}
                />
              </div>

              <div key={"min_population" + defaultValues.min_population}>
                <label
                  htmlFor="min_population"
                  className="block"
                  title={fieldDescriptions.min_population.longDescription}
                >
                  {fieldDescriptions.min_population.title}
                </label>
                <input
                  type="number"
                  name="min_population"
                  id="min_population"
                  defaultValue={defaultValues.min_population}
                  className="rounded border-2 p-1"
                />
                <ErrorMessages path="threshold" errors={actionData?.errors} />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-row gap-2 p-2">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={state !== "idle"}
          >
            {state === "submitting" ? "Running..." : "Recluster"}
          </button>
          <Link
            to="../../.."
            relative="path"
            className=" btn-outline btn btn-sm"
          >
            Back
          </Link>
        </div>
        <ToolHistory
          showInteractiveVersion={interactivness}
          hasInteractiveVersion={maxInteractivness}
        />
      </Form>
      <div>
        <details open={true}>
          <summary>Clusters</summary>
          <ReClusterTable clusters={clusters} />
        </details>
        {scores && plotlyPlotsStripped && (
          <details open={true}>
            <summary>Capri evaluation</summary>
            <ClientOnly fallback={<p>Loading...</p>}>
              {() => (
                <CaprievalReport
                  scores={scores}
                  prefix="../../files/output/"
                  plotlyPlots={plotlyPlotsStripped}
                />
              )}
            </ClientOnly>
          </details>
        )}
      </div>
    </>
  );
}
