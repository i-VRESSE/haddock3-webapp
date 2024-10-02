import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import { ClientOnly } from "~/components/ClientOnly";
import { Button } from "~/components/ui/button";
import { Cluster } from "~/contactmap/Cluster.client";
import {
  ContactMapCluster,
  getClusterInfo,
  getClusters,
  getModelInfo,
  getParams,
  isContactMapModule,
} from "~/contactmap/contactmap.server";
import { getCompletedJobById, jobIdFromParams } from "~/models/job.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobid = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "-1");
  const bartenderToken = await getBartenderToken(request);
  await getCompletedJobById(jobid, bartenderToken);

  const moduleInfo = await isContactMapModule(
    jobid,
    moduleIndex,
    bartenderToken,
  );
  const moduleParams = await getParams({
    jobid,
    moduleIndex,
    bartenderToken,
    moduleIndexPadding: moduleInfo.indexPadding,
  });

  const clusterIds = await getClusters(moduleInfo, bartenderToken);
  if (params.cluster === undefined) {
    return redirect(
      `/jobs/${jobid}/analysis/contactmap/${moduleIndex}/${clusterIds.ids[0]}`,
    );
  }
  const clusterId = params.cluster;
  let cluster: ContactMapCluster;
  if (clusterIds.clustered) {
    cluster = await getClusterInfo(
      parseInt(clusterId),
      moduleInfo,
      bartenderToken,
      moduleParams,
    );
  } else {
    cluster = await getModelInfo(
      parseInt(clusterId),
      moduleInfo,
      bartenderToken,
      moduleParams,
      clusterIds.fns[clusterIds.ids.indexOf(parseInt(clusterId))],
    );
  }
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
        {clusterIds.ids.map((id) => {
          if (id === cluster.id) {
            return (
              <Button key={id} disabled>
                {clusterIds.clustered ? "Cluster" : "Model"} {id}
              </Button>
            );
          }
          return (
            <Button key={id} asChild variant="secondary">
              <a
                href={id.toString()}
                title={`Show contact map plots for cluster ${id}`}
              >
                {clusterIds.clustered ? "Cluster" : "Model"} {id}
              </a>
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
