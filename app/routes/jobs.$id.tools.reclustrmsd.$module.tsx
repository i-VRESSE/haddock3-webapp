import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { type ChangeEvent, useState } from "react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { ClientOnly } from "~/components/ClientOnly";
import { ErrorMessages } from "~/components/ErrorMessages";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { ReWarning } from "~/components/ReWarning";
import { ToolHistory } from "~/components/ToolHistory";
import {
  jobIdFromParams,
  getJobById,
  buildPath,
  listOutputFiles,
} from "~/models/job.server";
import { ClusterTable } from "~/tools/reclust";
import {
  Schema,
  getClusters,
  getParams,
  reclustrmsd,
} from "~/tools/reclustrmsd.server";
import type { CaprievalPlotlyProps } from "~/tools/rescore.server";
import {
  getCaprievalPlots,
  getPlotSelection,
  getScores,
} from "~/tools/rescore.server";
import { getPreviousCaprievalModule, moduleInfo } from "~/tools/shared";
import { CompletedJobs } from "~/utils";

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
  // TODO dont show caprieval if interactive app has not been run yet.
  const caprievalModuleIndex = getPreviousCaprievalModule(
    outputFiles,
    moduleIndex,
    interactivness
  );
  const scores = await getScores(
    jobId,
    interactivness ? moduleIndex : caprievalModuleIndex,
    interactivness,
    token,
    moduleIndexPadding,
    interactivness ? "clustrmsd" : "caprieval"
  );
  const { scatterSelection, boxSelection } = getPlotSelection(request.url);
  const plotlyPlots = await getCaprievalPlots(
    jobId,
    interactivness ? moduleIndex : caprievalModuleIndex,
    interactivness,
    token,
    moduleIndexPadding,
    scatterSelection,
    boxSelection,
    interactivness ? "clustrmsd" : "caprieval"
  );

  return json({
    moduleIndex,
    moduleName,
    defaultValues,
    interactivness,
    maxInteractivness,
    clusters,
    scores,
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
  const result = safeParse(Schema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const clustfccParams = result.data;
  const outputFiles = await listOutputFiles(jobId, token, 1);
  const interactivness = moduleInfo(outputFiles, moduleIndex);
  const clustccDir = buildPath({
    moduleIndex,
    moduleName: "clustrmsd",
    interactivness: 0,
    moduleIndexPadding: interactivness[2],
  });
  await reclustrmsd(jobId, moduleIndex, clustccDir, clustfccParams, token);
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
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps;
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
                type="text"
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
                  type="text"
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
            {state !== "idle" ? "Running..." : "Recluster"}
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
                <CaprievalReport
                  scores={scores}
                  prefix="../files/output/"
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
