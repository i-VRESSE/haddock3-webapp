import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  flatten,
  maxLength,
  minLength,
  object,
  safeParse,
  string,
  pipe,
} from "valibot";
import { getBartenderToken } from "~/bartender-client/token.server";
import { jobIdFromParams, updateJobName } from "~/models/job.server";

export const Schema = object({
  name: pipe(string(), minLength(1), maxLength(200)),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const formData = await request.formData();
  const result = safeParse(Schema, Object.fromEntries(formData.entries()));
  if (!result.success) {
    const errors = flatten<typeof Schema>(result.issues);
    return json({ errors }, { status: 422 });
  }
  const name = result.output.name;
  await updateJobName(jobId, name, token);
  return json({ name });
}
