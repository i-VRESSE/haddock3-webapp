import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

import { submitJob } from "~/models/applicaton.server";
import { getLevel, isSubmitAllowed } from "~/models/user.server";
import { WORKFLOW_CONFIG_FILENAME } from "~/models/constants";
import { getUser } from "~/auth.server";
import { getAccessToken } from "~/bartender_token.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  // TODO get roles of current user
  const level = await getLevel(
    user ? user.roles.map((r) => r.name) : undefined
  );
  if (!isSubmitAllowed(level)) {
    throw new Error("Forbidden");
  }
  return json({ level });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");

  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }

  const accessToken = await getAccessToken(request);
  const job = await submitJob(upload, accessToken!);
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
          <label className="label">
            <input
              className="file-input"
              type="file"
              name="upload"
              accept="application/zip,.zip"
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit job
        </button>
      </Form>
    </main>
  );
}
