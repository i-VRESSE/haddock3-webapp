import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getJobById, jobIdFromParams } from "~/models/job.server";
import { CompletedJobs } from "~/bartender-client/types";
import { Button } from "~/components/ui/button";
import { getClusters, getClusterInfo, isContactMapModule, ContactMapCluster } from "~/contactmap/contactmap.server";
import { Cluster } from "~/contactmap/Cluster.client";
import { ClientOnly } from "~/components/ClientOnly";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobid = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "-1");
  const bartenderToken = await getBartenderToken(request);
  const job = await getJobById(jobid, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }

  const moduleInfo = await isContactMapModule(jobid, moduleIndex, bartenderToken);
  const clusterIds = await getClusters(moduleInfo, bartenderToken);
  if (params.cluster === undefined) {
    return redirect(`/jobs/${jobid}/analysis/contactmap/${moduleIndex}/${clusterIds[0]}`);
  }
  const clusterId = params.cluster;
  const cluster = await getClusterInfo(parseInt(clusterId), moduleInfo, bartenderToken);
  return json({ moduleIndex, clusterIds, cluster, jobid });
};

export default function ContactMapPage() {
  const { moduleIndex, clusterIds, cluster, jobid } =
    useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl">Contact map of module {moduleIndex}</h2>
      <div className="pb-4">
        <Button asChild variant="outline">
          <Link title="Browse" to={`/jobs/${jobid}/browse`}>
            Back to browse
          </Link>
        </Button>
      </div>
      <div className="flex flex-row gap-2 pb-2">
        {clusterIds.map((id) => {
          if (id === cluster.id) {
            return (
              <Button key={id} disabled>
                Cluster {id}
              </Button>
            );
          }
          return (
            <Button key={id} asChild variant="secondary">
              <a href={id.toString()} title={`Show contact map plots for cluster ${id}`}>Cluster {id}</a>
            </Button>
          );
        })}
      </div>
      <ClientOnly fallback={<p>Loading...</p>}>
          {() => <Cluster cluster={cluster as ContactMapCluster} />}
      </ClientOnly>
    </>
  );
}
