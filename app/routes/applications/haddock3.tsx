import { type ActionArgs, type LoaderArgs, redirect } from "@remix-run/node";
import { ClientOnly } from "remix-utils";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { getAccessToken } from "~/cookies.server";

import { submitJob } from "~/models/applicaton.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const name = 'haddock3'
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

export const links = () => [...haddock3Styles()];

export default function ApplicationSlug() {
  return (
    <main>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder />}
      </ClientOnly>
    </main>
  );
}
