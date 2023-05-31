import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { type ActionArgs, type LoaderArgs, redirect } from "@remix-run/node";

import { getCatalog } from "~/catalogs/index.server";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { submitJob } from "~/models/applicaton.server";
import { checkAuthenticated, getLevel, isSubmitAllowed } from "~/models/user.server";
import { getSession } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request);
  const level = await getLevel(session.data.roles);
  // When user does not have a level he/she
  // can still use builder with easy level
  // but cannot submit only download
  const catalogLevel = level === "" ? "easy" : level;
  const catalog = await getCatalog(catalogLevel);
  return { catalog, submitAllowed: isSubmitAllowed(level) };
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const upload = formData.get("upload");

  if (typeof upload === "string" || upload === null) {
    throw new Error("Bad upload");
  }
  const session = await getSession(request)
  const accessToken = session.data.bartenderToken
  checkAuthenticated(accessToken);
  const level = await getLevel(session.data.roles)
  if (!isSubmitAllowed(level)) {
    throw new Error("Forbidden");
  }
  const job = await submitJob(upload, accessToken!);
  const job_url = `/jobs/${job.id}`;
  return redirect(job_url);
};

export const links = () => [...haddock3Styles()];

// remix-utils gave import error on remix v1.15.0 so I copied the ClientOnly code from
// https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
let hydrating = true;

function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

type Props = {
  /**
   * You are encouraged to add a fallback that is the same dimensions
   * as the client rendered children. This will avoid content layout
   * shift which is disgusting
   */
  children(): ReactNode;
  fallback?: ReactNode;
};
function ClientOnly({ children, fallback = null }: Props) {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>;
}

export default function ApplicationSlug() {
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
