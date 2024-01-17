import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { ErrorMessages } from "~/components/ErrorMessages";
import { ToolHistory } from "~/components/ToolHistory";
import {
  jobIdFromParams,
  getJobById,
  buildPath,
  listOutputFiles,
} from "~/models/job.server";
import {
  Schema,
  getClusters,
  getParams,
  reclustfcc,
} from "~/tools/reclustfcc.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";
import { ReWarning } from "~/components/ReWarning";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import type { CaprievalPlotlyProps } from "~/models/caprieval.server";
import {
  getScores,
  getPlotSelection,
  getCaprievalPlots,
} from "~/models/caprieval.server";
import { moduleInfo } from "~/models/module_utils";
import { ReClusterTable } from "~/tools/ReClusterTable";

const fieldDescriptions = getModuleDescriptions(`clustfcc`, [
  "clust_cutoff",
  "strictness",
  "min_population",
]);

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobid = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const bartenderToken = await getBartenderToken(request);
  const job = await getJobById(jobid, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const outputFiles = await listOutputFiles(jobid, bartenderToken, 1);
  const [moduleName, hasInteractiveVersion, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );
  const i = new URL(request.url).searchParams.get("i");
  const showInteractiveVersion = i === null ? hasInteractiveVersion : !!i;
  const defaultValues = await getParams({
    jobid,
    moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });
  const clusters = await getClusters({
    jobid,
    moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });
  let scores;
  let plotlyPlots;
  if (showInteractiveVersion) {
    scores = await getScores({
      jobid,
      module: moduleIndex,
      isInteractive: showInteractiveVersion,
      bartenderToken,
      moduleIndexPadding,
      moduleName: "clustfcc",
    });
    const { scatterSelection, boxSelection } = getPlotSelection(request.url);
    plotlyPlots = await getCaprievalPlots({
      jobid,
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
  const clustParams = result.data;
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [, , moduleIndexPadding] = moduleInfo(outputFiles, moduleIndex);
  const clustfccDir = buildPath({
    moduleIndex,
    moduleName: "clustfcc",
    moduleIndexPadding,
  });
  await reclustfcc({
    jobid: jobId,
    moduleIndex,
    clustfccDir,
    params: clustParams,
    bartenderToken,
  });
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
    plotlyPlots,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const plotlyPlotsStripped = plotlyPlots as CaprievalPlotlyProps | undefined;
  const { state } = useNavigation();
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
            title={fieldDescriptions.clust_cutoff.longDescription}
          >
            <label htmlFor="fraction_cutoff" className="block">
              {fieldDescriptions.clust_cutoff.title}
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
            title={fieldDescriptions.strictness.longDescription}
          >
            <label htmlFor="strictness" className="block">
              {fieldDescriptions.strictness.title}
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
          <div
            key={"min_population" + defaultValues.min_population}
            title={fieldDescriptions.min_population.longDescription}
          >
            <label htmlFor="threshold" className="block">
              {fieldDescriptions.min_population.title}
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
