import { type LoaderArgs } from "@remix-run/node";

import { getCatalog } from "~/catalogs/index.server";
import { Haddock3WorkflowBuilder } from "~/components/Haddock3/Form.client";
import { haddock3Styles } from "~/components/Haddock3/styles";
import { isSubmitAllowed } from "~/models/user.server";
import { action } from "~/routes/builder";
import { useLoaderData } from "@remix-run/react";
import { ClientOnly } from "~/components/ClientOnly";
import { getJobById, jobIdFromParams } from "~/models/job.server";
import { getUser } from "~/auth.server";
import { getBartenderTokenByUser } from "~/bartender_token.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobId = jobIdFromParams(params);
  const user = await getUser(request);
  const level = user.preferredExpertiseLevel;
  const catalog = await getCatalog(level);
  const token = await getBartenderTokenByUser(user);
  // Check that user can see job, otherwise throw 404
  await getJobById(jobId, token);
  // return same shape as loader in ~/routes/builder.tsx
  return {
    catalog,
    submitAllowed: isSubmitAllowed(level),
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
  return (
    <main>
      <p>
        Editing input of <a href={`/jobs/${jobId}`}>job {jobId}</a>
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Haddock3WorkflowBuilder />}
      </ClientOnly>
    </main>
  );
}
