import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender-client/token.server";
import { ErrorMessages } from "~/components/ErrorMessages";
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
import { CompletedJobs } from "~/bartender-client/types";
import { ClientOnly } from "~/components/ClientOnly";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { moduleInfo } from "~/models/module_utils";
import { shouldShowInteractiveVersion } from "~/tools/shared";
import { ReClusterTable } from "~/tools/ReClusterTable";
import { ReWarning } from "~/tools/ReWarning";
import { ToolHistory } from "~/tools/ToolHistory";
import type { CaprievalPlotlyProps } from "~/caprieval/caprieval.server";
import {
  getScores,
  getPlotSelection,
  getCaprievalPlots,
} from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const fieldDescriptions = getModuleDescriptions(`clustfcc`, [
  "clust_cutoff",
  "strictness",
  "min_population",
]);

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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
  const showInteractiveVersion = shouldShowInteractiveVersion(
    request.url,
    hasInteractiveVersion
  );
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
      moduleName: "clustfcc",
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

export const action = async ({ request, params }: LoaderFunctionArgs) => {
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
    const errors = flatten(result.issues);
    return json({ errors }, { status: 400 });
  }
  const clustParams = result.output;
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
            <Label htmlFor="fraction_cutoff">
              {fieldDescriptions.clust_cutoff.title}
            </Label>
            <Input
              type="text"
              name="clust_cutoff"
              id="clust_cutoff"
              defaultValue={defaultValues.clust_cutoff}
            />
            <ErrorMessages path="clust_cutoff" errors={actionData?.errors} />
          </div>
          <div
            key={"strictness" + defaultValues.strictness}
            title={fieldDescriptions.strictness.longDescription}
          >
            <Label htmlFor="strictness">
              {fieldDescriptions.strictness.title}
            </Label>
            <Input
              type="text"
              name="strictness"
              id="strictness"
              defaultValue={defaultValues.strictness}
            />
            <ErrorMessages path="strictness" errors={actionData?.errors} />
          </div>
          <div
            key={"min_population" + defaultValues.min_population}
            title={fieldDescriptions.min_population.longDescription}
          >
            <Label htmlFor="threshold">
              {fieldDescriptions.min_population.title}
            </Label>
            <Input
              type="number"
              name="min_population"
              id="min_population"
              defaultValue={defaultValues.min_population}
            />
            <ErrorMessages path="min_population" errors={actionData?.errors} />
          </div>
        </div>
        <div className="flex flex-row gap-2 p-2">
          <Button type="submit" disabled={state !== "idle"}>
            {state === "submitting" ? "Running..." : "Recluster"}
          </Button>
          <Button asChild variant="outline">
            <Link to="../../.." relative="path">
              Back
            </Link>
          </Button>
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
