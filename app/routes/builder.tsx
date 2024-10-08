import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { type ICatalog } from "@i-vresse/wb-core/dist/types";

import { getCatalogForBuilder } from "~/catalogs/index.server";
import { submitJob } from "~/models/applicaton.server";
import { isSubmitAllowed } from "~/models/user.server";
import { ClientOnly } from "~/components/ClientOnly";
import { getOptionalUser, mustBeAllowedToSubmit } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";
import { Haddock3WorkflowBuilder } from "~/builder/Form.client";
import { parseUploadRequest } from "~/lib/parseUploadRequest.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{
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
  const catalog = getCatalogForBuilder(catalogLevel);
  return {
    catalog,
    submitAllowed: isSubmitAllowed(level ?? ""),
    archive: undefined,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await parseUploadRequest(request);
  const user = await mustBeAllowedToSubmit(request);
  const accessToken = await getBartenderTokenByUser(user);
  const job = await submitJob(formData, accessToken, user.expertiseLevels);
  const job_url = `/jobs/${job.id}`;
  return redirect(job_url);
};

export default function Builder() {
  // TODO replace ClientOnly with Suspense,
  // see https://github.com/sergiodxa/remix-utils#clientonly
  return (
    <main className="workflow-builder-app m-auto min-w-[50rem] max-w-[100rem]">
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder />}
      </ClientOnly>
    </main>
  );
}
