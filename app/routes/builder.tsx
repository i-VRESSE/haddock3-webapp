import { type ActionArgs, type LoaderArgs, redirect } from "@remix-run/node";

import { getCatalog } from "~/catalogs/index.server";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { submitJob } from "~/models/applicaton.server";
import {
  checkAuthenticated,
  getLevel,
  isSubmitAllowed,
} from "~/models/user.server";
import { getSession } from "~/session.server";
import { ClientOnly } from "remix-utils";
import { ICatalog } from "@i-vresse/wb-core/dist/types";

export const loader = async ({
  request,
}: LoaderArgs): Promise<{
  catalog: ICatalog;
  submitAllowed: boolean;
  archive: string | undefined;
}> => {
  const session = await getSession(request);
  const level = await getLevel(session.data.roles);
  // When user does not have a level he/she
  // can still use builder with easy level
  // but cannot submit only download
  const catalogLevel = level === "" ? "easy" : level;
  const catalog = await getCatalog(catalogLevel);
  return { catalog, submitAllowed: isSubmitAllowed(level), archive: undefined };
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");

  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }
  const session = await getSession(request);
  const accessToken = session.data.bartenderToken;
  checkAuthenticated(accessToken);
  const level = await getLevel(session.data.roles);
  if (!isSubmitAllowed(level)) {
    throw new Error("Forbidden");
  }
  const job = await submitJob(upload, accessToken!);
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
