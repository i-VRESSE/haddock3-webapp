import { type ActionArgs, json, type LoaderArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getAccessToken } from "~/cookies";

import { applicationByName, submitJob } from "~/models/applicaton.server";

export const loader = async ({ params }: LoaderArgs) => {
  const name = params.name || "";
  const app = await applicationByName(name);
  return json({ name, ...app });
};

export const action = async ({ request, params }: ActionArgs) => {
  const name = params.name || "";
  const formData = await request.formData();
  const upload = formData.get('upload');

  if (typeof upload === 'string' || upload === null) {
    throw new Error('Bad upload')
  }
  const access_token = await getAccessToken(request)
  if (access_token === undefined) {
    throw new Error('Unauthenticated')
  }

  const job = await submitJob(name, upload, access_token)
  const job_url = `/jobs/${job.id}`
  return redirect(job_url)
};

export default function ApplicationSlug() {
  const { name, command, config } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{name}</h1>
      <p>Command: {command}</p>
      <p>Config: {config}</p>
      <Form method="post" encType="multipart/form-data">
        <label>
          Upload:{" "}
        <input type="file" name="upload" />
        </label>
        <button type="submit">Submit job</button>
      </Form>
    </main>
  );
}
