import { type ActionArgs, type LoaderArgs, redirect } from "@remix-run/node";
import { ClientOnly } from "remix-utils";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { getAccessToken } from "~/cookies.server";

import { submitJob } from "~/models/applicaton.server";

export const loader = async ({ request }: LoaderArgs) => {
  const access_token = await getAccessToken(request);
  if (access_token === undefined) {
    throw new Error("Unauthenticated");
  }
  // TODO do not hardcode level to guru, but make it part of user. Possibly using a role, see https://github.com/i-VRESSE/bartender/issues/22
  const level = 'guru'
  // TODO do not download each time
  const catalog_url = `https://github.com/i-VRESSE/workflow-builder/raw/main/packages/haddock3_catalog/public/catalog/haddock3.${level}.yaml`
  const {fetchCatalog } = await import("@i-vresse/wb-core/dist/catalog.js");
  const catalog = await fetchCatalog(catalog_url)
  // TODO example can not found on this server, so disable for now
  catalog.examples = {}
  return { catalog };
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
  // TODO replace ClientOnly with Suspense, 
  // see https://github.com/sergiodxa/remix-utils#clientonly
  return (
    <main>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder/>}
      </ClientOnly>
    </main>
  );
}
