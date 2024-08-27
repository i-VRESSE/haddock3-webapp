import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import { getCompletedJobById, jobIdFromParams } from "~/models/job.server";
import { Button } from "~/components/ui/button";
import { ClientOnly } from "~/components/ClientOnly";
import {
  getClusterInfo,
  getClusters,
  isAlaScanModule,
  type ClusterInfo,
} from "~/alascan/alascan.server";
import { Cluster } from "~/alascan/Cluster.client";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobid = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "-1");
  const bartenderToken = await getBartenderToken(request);
  await getCompletedJobById(jobid, bartenderToken);

  const moduleInfo = await isAlaScanModule(jobid, moduleIndex, bartenderToken);

  const clusterIds = await getClusters(moduleInfo, bartenderToken);
  if (params.cluster === undefined) {
    return redirect(
      `/jobs/${jobid}/analysis/alascan/${moduleIndex}/${clusterIds[0]}`,
    );
  }
  const clusterId = params.cluster;
  const cluster = await getClusterInfo(clusterId, moduleInfo, bartenderToken);
  return json({ moduleIndex, clusterIds, cluster, jobid });
};

export default function AlaScanPage() {
  const { moduleIndex, clusterIds, cluster, jobid } =
    useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl">Alanine scan of module {moduleIndex}</h2>
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
              <a
                href={id.toString()}
                title={`Show alanine scan plot for cluster ${id}`}
              >
                Cluster {id}
              </a>
            </Button>
          );
        })}
      </div>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <Cluster info={cluster as ClusterInfo} />}
      </ClientOnly>
    </>
  );
}
