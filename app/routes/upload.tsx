import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { submitJob } from "~/models/applicaton.server";

import { mustBeAllowedToSubmit } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { InvalidUploadError } from "~/models/errors";
import { ValidationError } from "@i-vresse/wb-core/dist/validate.js";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");

  const user = await mustBeAllowedToSubmit(request);
  const token = await getBartenderTokenByUser(user);
  try {
    if (typeof upload === "string" || upload === null) {
      throw new InvalidUploadError("Bad upload, no file found");
    }

    const job = await submitJob(upload, token, user.expertiseLevels);
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
  const actionData = useActionData<typeof action>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 text-3xl">Upload haddock3 archive</h1>
      <p>
        Archive should contain workfow configuration file called{" "}
        {WORKFLOW_CONFIG_FILENAME}.
      </p>
      <Form method="post" encType="multipart/form-data">
        <div className="form-control py-2">
          <Input
            type="file"
            name="upload"
            accept="application/zip,.zip"
            required
          />
        </div>
        <div className="py-2 text-red-500">
          {actionData?.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
        <Button type="submit">Submit job</Button>
      </Form>
    </main>
  );
}
