import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

import { submitJob } from "~/models/applicaton.server";

import { mustBeAllowedToSubmit } from "~/auth.server";
import { getBartenderToken } from "~/bartender-client/token.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");

  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }

  const token = await getBartenderToken(request);
  const job = await submitJob(upload, token);
  const job_url = `/jobs/${job.id}`;
  return redirect(job_url);
};

export default function ApplicationSlug() {
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 text-3xl">Upload haddock3 archive</h1>
      <p>
        Archive should contain workfow configuration file called{" "}
        {WORKFLOW_CONFIG_FILENAME}.
      </p>
      <Form method="post" encType="multipart/form-data">
        <div className="form-control">
          <input
            className="file-input"
            type="file"
            name="upload"
            accept="application/zip,.zip"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit job
        </button>
      </Form>
    </main>
  );
}
