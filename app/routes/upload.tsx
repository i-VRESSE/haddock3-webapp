import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";

import { submitJob } from "~/models/applicaton.server";

import { mustBeAllowedToSubmit } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ForbiddenError, InvalidUploadError } from "~/models/errors";
import { ValidationError } from "@i-vresse/wb-core/dist/validate.js";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { ValiError } from "valibot";
import { parseUploadRequest } from "../lib/parseUploadRequest";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await mustBeAllowedToSubmit(request);
  const runImportAllowed = user.expertiseLevels.includes("guru");
  return json({ runImportAllowed });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await parseUploadRequest(request);

  const user = await mustBeAllowedToSubmit(request);
  const token = await getBartenderTokenByUser(user);
  try {
    const job = await submitJob(formData, token, user.expertiseLevels);
    const job_url = `/jobs/${job.id}`;
    return redirect(job_url);
  } catch (error) {
    if (error instanceof InvalidUploadError) {
      return json({ errors: [error.message] }, { status: 422 });
    }
    if (error instanceof ValidationError) {
      const errors = flattenValidationErrors(error);
      return json({ errors: [error.message, ...errors] }, { status: 422 });
    }
    if (error instanceof ValiError) {
      return json(
        { errors: error.issues.map((i) => i.message) },
        { status: 422 }
      );
    }
    if (error instanceof ForbiddenError) {
      return json({ errors: [error.message] }, { status: 403 });
    }
    throw error;
  }
};

function flattenValidationErrors(error: ValidationError) {
  return error.errors.map((e) => {
    let message = e.message;
    if (e.workflowPath) {
      message = `Error in ${e.workflowPath}: ${message}`;
      if (e.params.additionalProperty) {
        message += `: ${e.params.additionalProperty}`;
      }
    }
    return message;
  });
}

export default function UploadPage() {
  const { runImportAllowed } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { state } = useNavigation()
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 text-3xl">Upload haddock3 archive</h1>
      <Form method="post" encType="multipart/form-data">
        {runImportAllowed ? (
          <RadioGroup name="kind" defaultValue="workflow">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="workflow" id="workflow" />
              <Label htmlFor="workflow">
                <b>Workflow</b>: Archive with workfow configuration file called{" "}
                {WORKFLOW_CONFIG_FILENAME}. Workflow will be submitted.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="run" id="run" />
              <Label htmlFor="run">
                <b>Run</b>: Archive of a haddock3 run. The archive should have
                run dir as root. The run should have haddock3, haddock3-clean
                and haddock3-analyse executed on it. Maximum size is 1Gb.
              </Label>
            </div>
          </RadioGroup>
        ) : (
          <>
            <p>
              Archive should contain workfow configuration file called{" "}
              {WORKFLOW_CONFIG_FILENAME}.
            </p>
            <input type="hidden" name="kind" value="workflow" />
          </>
        )}
        <div className="py-2">
          <Input
            type="file"
            name="upload"
            accept="application/zip,.zip"
            className="file:bg-secondary file:text-secondary-foreground"
            required
          />
        </div>
        <div className="py-2 text-red-500">
          {actionData?.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
        <Button type="submit" disabled={state === 'submitting'}>
          {state === 'submitting' ? 'Submitting job ...' : 'Submit job'}
          </Button>
      </Form>
    </main>
  );
}
