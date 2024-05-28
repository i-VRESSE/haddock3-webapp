import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender-client/token.server";
import {
  jobIdFromParams,
  buildPath,
  listOutputFiles,
  getCompletedJobById,
} from "~/models/job.server";
import { ClientOnly } from "~/components/ClientOnly";
import { rescore } from "~/tools/rescore.server";
import { moduleInfo } from "~/models/module_utils";
import { shouldShowInteractiveVersion } from "~/tools/shared";
import { RescoreForm } from "~/tools/RescoreForm";
import type { CaprievalData } from "~/caprieval/caprieval.server";
import {
  getWeights,
  getPlotSelection,
  getCaprievalData,
  WeightsSchema,
} from "~/caprieval/caprieval.server";
import { CaprievalReport } from "~/caprieval/CaprievalReport.client";
import { prefix } from "~/prefix";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  const bartenderToken = await getBartenderToken(request);
  await getCompletedJobById(jobId, bartenderToken);
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [moduleName, hasInteractiveVersion, moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex,
  );
  const showInteractiveVersion = shouldShowInteractiveVersion(
    request.url,
    hasInteractiveVersion,
  );
  const weights = await getWeights({
    jobid: jobId,
    module: moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
  });

  const { scatterSelection, boxSelection } = getPlotSelection(request.url);
  const caprievalData = await getCaprievalData({
    jobid: jobId,
    module: moduleIndex,
    isInteractive: showInteractiveVersion,
    bartenderToken,
    moduleIndexPadding,
    scatterSelection,
    boxSelection,
    // report.html has path to pdb of ../../11_seletopclusts/cluster_2_model_1.pdb.gz
    // this page is rendered at /jobs/52/tools/rescore/12?i=1
    // the pdb file can be downloaed at /jobs/52/files/output/11_seletopclusts/cluster_1_model_1.pdb.gz
    // so we need to do some path manipulation,
    // with foo/bar/ negating the ../../ in the path
    structurePrefix: `${prefix}jobs/${jobId}/files/output/foo/bar/`,
  });
  return json({
    moduleIndex,
    weights,
    showInteractiveVersion,
    hasInteractiveVersion,
    caprievalData,
  });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const bartenderToken = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "");
  await getCompletedJobById(jobId, bartenderToken);
  const formData = await request.formData();
  const result = safeParse(WeightsSchema, Object.fromEntries(formData));
  if (!result.success) {
    const errors = flatten(result.issues);
    return json({ errors }, { status: 400 });
  }
  const weights = result.output;
  const outputFiles = await listOutputFiles(jobId, bartenderToken, 1);
  const [moduleName, , moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex,
  );
  const capriDir = buildPath({
    moduleIndex,
    moduleName,
    moduleIndexPadding,
  });
  await rescore({
    jobid: jobId,
    moduleIndex,
    capriDir,
    weights,
    bartenderToken,
  });
  return json({ errors: { nested: {} } });
};

export default function RescorePage() {
  const {
    moduleIndex,
    weights,
    caprievalData,
    showInteractiveVersion,
    hasInteractiveVersion,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  // Strip SerializeObject<UndefinedToOptional wrapper
  const caprievalDataCasted = caprievalData as CaprievalData;
  return (
    <>
      <RescoreForm
        weights={weights}
        showInteractiveVersion={showInteractiveVersion}
        hasInteractiveVersion={hasInteractiveVersion}
        moduleIndex={moduleIndex}
        errors={actionData?.errors}
      />
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <>
            <CaprievalReport {...caprievalDataCasted} />
          </>
        )}
      </ClientOnly>
    </>
  );
}
