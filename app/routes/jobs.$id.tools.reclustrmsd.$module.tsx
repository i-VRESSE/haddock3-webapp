import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender-client/token.server";
import type { CaprievalData } from "~/caprieval/caprieval.server";
import {
  getPlotSelection,
  getCaprievalData,
} from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { ClientOnly } from "~/components/ClientOnly";
import { ErrorMessages } from "~/components/ErrorMessages";
import {
  jobIdFromParams,
  buildPath,
  listOutputFiles,
  getCompletedJobById,
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

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { prefix } from "~/prefix";
import { MatrixPlot } from "~/tools/MatrixPlot.client";
import type { Data, Layout } from "plotly.js";
import { getMatrixPlot } from "~/tools/recluster.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const bartenderToken = await getBartenderToken(request);
  await getCompletedJobById(jobId, bartenderToken);
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [moduleName, hasInteractiveVersion, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex,
  );
  const showInteractiveVersion = shouldShowInteractiveVersion(
    request.url,
    hasInteractiveVersion,
  );
  const info = {
    jobid: jobId,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  };
  const defaultValues = await getParams({
    moduleIndex,
    ...info,
  });
  const clusters = await getClusters({
    moduleIndex,
    ...info,
  });
  const matrixPlot = await getMatrixPlot({
    moduleIndex,
    ...info,
    moduleName: "clustrmsd",
    htmlFilename: "rmsd_matrix.html",
  });
  let caprievalData;
  if (showInteractiveVersion) {
    const { scatterSelection, boxSelection } = getPlotSelection(request.url);
    caprievalData = await getCaprievalData({
      module: moduleIndex,
      ...info,
      scatterSelection,
      boxSelection,
      moduleName: "clustrmsd",
      structurePrefix: `${prefix}jobs/${jobId}/files/output/foo/bar/`,
    });
  }
  return json({
    moduleIndex,
    moduleName,
    defaultValues,
    interactivness: showInteractiveVersion,
    maxInteractivness: hasInteractiveVersion,
    clusters,
    matrixPlot,
    caprievalData,
  });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const bartenderToken = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  await getCompletedJobById(jobId, bartenderToken);
  const formData = await request.formData();
  const result = safeParse(Schema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.issues);
    return json({ errors }, { status: 400 });
  }
  const clustparams = result.output;
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
    matrixPlot,
    caprievalData,
  } = useLoaderData<typeof loader>();
  // Strip JsonifyObject wrapper
  const caprievalDataCasted = caprievalData as CaprievalData | undefined;
  const actionData = useActionData<typeof action>();
  const [criterion, setCriterion] = useState(defaultValues.criterion);
  const handleCriterionChange = (value: string) => {
    if (value === "maxclust" || value === "distance") {
      setCriterion(value);
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
            <RadioGroup
              defaultValue={criterion}
              name="criterion"
              onValueChange={(value) => handleCriterionChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maxclust" id="maxclust" />
                <Label htmlFor="maxclust">By number of desired clusters</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distance" id="distance" />
                <Label htmlFor="distance">By distance</Label>
              </div>
            </RadioGroup>
          </div>
          {/* key is used to force React to re-render the component
          when the weights changes */}
          {criterion === "maxclust" && (
            <div key={"n_clusters" + defaultValues.n_clusters}>
              <Label
                htmlFor="n_clusters"
                title={fieldDescriptions.n_clusters.longDescription}
              >
                {fieldDescriptions.n_clusters.title}
              </Label>
              <Input
                type="number"
                name="n_clusters"
                id="n_clusters"
                defaultValue={defaultValues.n_clusters}
              />
              <ErrorMessages path="n_clusters" errors={actionData?.errors} />
            </div>
          )}
          {criterion === "distance" && (
            <>
              <div key={"clust_cutoff" + defaultValues.clust_cutoff}>
                <Label
                  htmlFor="clust_cutoff"
                  title={fieldDescriptions.clust_cutoff.longDescription}
                >
                  {fieldDescriptions.clust_cutoff.title}
                </Label>
                <Input
                  type="text"
                  name="clust_cutoff"
                  id="clust_cutoff"
                  defaultValue={defaultValues.clust_cutoff}
                />
                <ErrorMessages
                  path="clust_cutoff"
                  errors={actionData?.errors}
                />
              </div>

              <div key={"min_population" + defaultValues.min_population}>
                <Label
                  htmlFor="min_population"
                  title={fieldDescriptions.min_population.longDescription}
                >
                  {fieldDescriptions.min_population.title}
                </Label>
                <Input
                  type="number"
                  name="min_population"
                  id="min_population"
                  defaultValue={defaultValues.min_population}
                />
                <ErrorMessages path="threshold" errors={actionData?.errors} />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-row gap-2 p-2">
          <Button type="submit" disabled={state !== "idle"}>
            {state === "submitting" ? "Running..." : "Recluster"}
          </Button>
          <Button variant="outline" asChild>
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
          <summary>Matrix</summary>
          <ClientOnly fallback={<p>Loading...</p>}>
            {() => (
              <MatrixPlot
                data={matrixPlot.data as Data[]}
                layout={matrixPlot.layout as Layout}
              />
            )}
          </ClientOnly>
        </details>
        <details open={false}>
          <summary>Clusters</summary>
          <ReClusterTable clusters={clusters} />
        </details>
        {caprievalDataCasted && (
          <details open={true}>
            <summary>Capri evaluation</summary>
            <ClientOnly fallback={<p>Loading...</p>}>
              {() => <CaprievalReport {...caprievalDataCasted} />}
            </ClientOnly>
          </details>
        )}
      </div>
    </>
  );
}
