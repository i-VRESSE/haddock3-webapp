import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/cookies.server";

import { applicationByName, submitJob } from "~/models/applicaton.server";
import { getLevel } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const name = "haddock3";
  const app = await applicationByName(name);
  const accessToken = await getAccessToken(request);
  if (accessToken === undefined) {
    throw new Error("Unauthenticated");
  }
  const level = await getLevel(accessToken)
  if (level === '') {
    throw new Error("Forbidden");
  }
  return json({ name, ...app });
};

export const action = async ({ request }: ActionArgs) => {
  const name = "haddock3";
  const formData = await request.formData();
  const upload = formData.get("upload");

  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }

  const job = await submitJob(name, upload, access_token);
  const job_url = `/jobs/${job.id}`;
  return redirect(job_url);
};

export default function ApplicationSlug() {
  const { config } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 text-3xl">Upload haddock3 archive</h1>
      <p>Archive should contain workfow configuration file called {config}.</p>
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
