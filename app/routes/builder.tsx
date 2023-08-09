import { type ActionArgs, type LoaderArgs, redirect } from "@remix-run/node";

import { getCatalog } from "~/catalogs/index.server";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { submitJob } from "~/models/applicaton.server";
import { isSubmitAllowed } from "~/models/user.server";
import { type ICatalog } from "@i-vresse/wb-core/dist/types";
import { ClientOnly } from "~/components/ClientOnly";
import { getOptionalUser, mustBeAllowedToSubmit } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender_token.server";

export const loader = async ({
  request,
}: LoaderArgs): Promise<{
  catalog: ICatalog;
  submitAllowed: boolean;
  archive: string | undefined;
}> => {
  const user = await getOptionalUser(request);
  const level = user ? user.preferredExpertiseLevel ?? "" : "";
  // When user does not have a level he/she
  // can still use builder with easy level
  // but cannot submit only download
  const catalogLevel = level === "" ? "easy" : level;
  const catalog = await getCatalog(catalogLevel);
  return { catalog, submitAllowed: isSubmitAllowed(level ?? ''), archive: undefined };
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");
  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }

  const user = await mustBeAllowedToSubmit(request);
  const accessToken = await getBartenderTokenByUser(user);
  const job = await submitJob(upload, accessToken);
  const job_url = `/jobs/${job.id}`;
  return redirect(job_url);
};

export const links = () => [...haddock3Styles()];

export default function Builder() {
  // TODO replace ClientOnly with Suspense,
  // see https://github.com/sergiodxa/remix-utils#clientonly
  return (
    <main>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder />}
      </ClientOnly>
    </main>
  );
}
