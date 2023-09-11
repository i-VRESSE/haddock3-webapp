import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { flatten, safeParse } from "valibot";

import { getBartenderToken } from "~/bartender_token.server";
import { ErrorMessages } from "~/components/ErrorMessages";
import {
  jobIdFromParams,
  getJobById,
  getWeights,
  WeightsSchema,
  getScores,
  step2rescoreModule,
  rescore,
} from "~/models/job.server";
import { CompletedJobs } from "~/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { CaprievalReport } from "~/components/Haddock3/CaprievalReport.client";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getJobById(jobId, token);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }
  const [module, interactivness] = await step2rescoreModule(jobId, token);
  const weights = await getWeights(jobId, module, interactivness, token);
  const scores = await getScores(jobId, module, interactivness, token);
  return json({ weights, scores });
};

export const action = async ({ request, params }: LoaderArgs) => {
  const token = await getBartenderToken(request);
  const jobId = jobIdFromParams(params);
  const formData = await request.formData();
  const result = safeParse(WeightsSchema, Object.fromEntries(formData));
  console.log(result);
  if (!result.success) {
    const errors = flatten(result.error);
    return json({ errors }, { status: 400 });
  }
  const weights = result.data;
  const module = await step2rescoreModule(jobId, token);
  await rescore(jobId, module[0], weights, token);
  return json({ errors: { nested: {} } });
};

export default function RescorePage() {
  const { weights, scores } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Form method="post">
        <h2 className="text-2xl">Rescore</h2>
        <div className="flex flex-row gap-4">
          <div>
            <label htmlFor="w_elec" className="block">
              Weight of the electrostatic component
            </label>
            <input
              type="text"
              name="w_elec"
              id="w_elec"
              defaultValue={weights.w_elec}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="w_elec" errors={actionData?.errors} />
          </div>
          <div>
            <label htmlFor="w_vdw" className="block">
              Weight of the van der Waals component
            </label>
            <input
              type="text"
              name="w_vdw"
              id="w_vdw"
              defaultValue={weights.w_vdw}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="w_vdw" errors={actionData?.errors} />
          </div>
          <div>
            <label htmlFor="w_desolv" className="block">
              Weight of the desolvation component
            </label>
            <input
              type="text"
              name="w_desolv"
              id="w_desolv"
              className="rounded border-2 p-1"
              defaultValue={weights.w_desolv}
            />
            <ErrorMessages path="w_desolv" errors={actionData?.errors} />
          </div>
          <div>
            <label htmlFor="w_bsa" className="block">
              Weight of the BSA component
            </label>
            <input
              type="text"
              name="w_bsa"
              id="w_bsa"
              defaultValue={weights.w_bsa}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="w_bsa" errors={actionData?.errors} />
          </div>
          <div>
            <label htmlFor="w_air" className="block">
              Weight of the AIR component
            </label>
            <input
              type="text"
              name="w_air"
              id="w_air"
              defaultValue={weights.w_air}
              className="rounded border-2 p-1"
            />
            <ErrorMessages path="w_air" errors={actionData?.errors} />
          </div>
        </div>
        <div className="flex flex-row gap-2 p-2">
          <button type="submit" className="btn btn-primary btn-sm">
            Rescore
          </button>
          {/* TODO add reset button, that resets to weights+scores of non-interactive job. */}
          <a href=".." className=" btn-outline btn btn-sm">
            Back
          </a>
        </div>
      </Form>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <CaprievalReport scores={scores} prefix="files/output/" />}
      </ClientOnly>
    </>
  );
}
