import type { LoaderArgs} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { safeParse } from "valibot";
import { getBartenderToken } from "~/bartender_token.server";
import { jobIdFromParams, getJobById, getWeights, WeightsSchema, getScores, step2rescoreModule, rescore } from "~/models/job.server";
import { CompletedJobs } from "~/utils";


export const loader = async ({ params, request }: LoaderArgs) => {
    const jobId = jobIdFromParams(params);
    const token = await getBartenderToken(request);
    const job = await getJobById(jobId, token);
    if (!CompletedJobs.has(job.state)) {
        throw new Error("Job is not completed");
    }
    const module = await step2rescoreModule(jobId, token);
    const weights = await getWeights(jobId, token);
    const scores = await getScores(jobId, module, token);
    return json({ weights, scores });
}

export const action = async ({ request, params }: LoaderArgs) => {
    const token = await getBartenderToken(request);
    const jobId = jobIdFromParams(params);
    const formData = await request.formData();
    const result = safeParse(WeightsSchema, Object.fromEntries(formData));
    if (!result.success) {
        throw json({ error: "Invalid weights" }, { status: 400 });
    }
    const weights = result.data;
    const module = await step2rescoreModule(jobId, token);
    const scores = await rescore(jobId, module, weights, token);
    return json({ weights, scores });
}


export default function RescorePage() {
    const { weights, scores } = useLoaderData<typeof loader>();

    return (
        <>
        <pre>
            {JSON.stringify(scores, null, 2)}
        </pre>
        <Form method="post">
            <h2>Rescore</h2>
            <label>
                Weight of the electrostatic component.
                <input type="number" name="w_elec" defaultValue={weights.w_elec} />
            </label>
            <label>
                Weight of the van der Waals component.
                <input type="number" name="w_vdw" defaultValue={weights.w_vdw} />
            </label>
            <label>
                Weight of the desolvation component.
                <input type="number" name="w_desolv" defaultValue={weights.w_desolv} />
            </label>
            <label>
                Weight of the BSA component.
                <input type="number" name="w_bsa" defaultValue={weights.w_bsa} />
            </label>
            <label>
                Weight of the AIR component.
                <input type="number" name="w_air" defaultValue={weights.w_air} />
            </label>
            <button type="submit">Rescore</button>
        </Form>
        </>
    )
}