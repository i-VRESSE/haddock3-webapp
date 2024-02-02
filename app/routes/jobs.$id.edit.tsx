import { type LoaderFunctionArgs } from "@remix-run/node";

import { getCatalog } from "~/catalogs/index.server";
import { isSubmitAllowed } from "~/models/user.server";
import { action } from "~/routes/builder";
import { Link, useLoaderData } from "@remix-run/react";
import { ClientOnly } from "~/components/ClientOnly";
import { getJobById, jobIdFromParams } from "~/models/job.server";
import { getUser } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender-client/token.server";
import { Haddock3WorkflowBuilder } from "~/builder/Form.client";
import { haddock3Styles } from "~/builder/styles";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobId = jobIdFromParams(params);
  const user = await getUser(request);
  const level = user.preferredExpertiseLevel;
  const catalog = getCatalog(level ?? "easy");
  const token = await getBartenderTokenByUser(user);
  // Check that user can see job, otherwise throw 404
  await getJobById(jobId, token);
  // return same shape as loader in ~/routes/builder.tsx
  return {
    catalog,
    submitAllowed: isSubmitAllowed(level ?? ""),
    archive: `/jobs/${jobId}/input.zip`,
    jobId,
  };
};

export { action };

export const links = () => [...haddock3Styles()];

export default function EditPage() {
  const { jobId } = useLoaderData<typeof loader>();
  // TODO replace ClientOnly with Suspense,
  // see https://github.com/sergiodxa/remix-utils#clientonly
  // might need upgrade to remix v2
  return (
    <main>
      <p>
        Editing input of <Link to={`/jobs/${jobId}`}>job {jobId}</Link>
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder />}
      </ClientOnly>
    </main>
  );
}
