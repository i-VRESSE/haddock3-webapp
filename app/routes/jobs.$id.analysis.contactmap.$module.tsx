import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getBartenderToken } from "~/bartender_token.server";
import {
  buildPath,
  getJobById,
  jobIdFromParams,
  listFilesAt,
  listOutputFiles,
} from "~/models/job.server";
import { moduleInfo } from "~/models/module_utils";
import { CompletedJobs } from "~/utils";

interface ContactMapCluster {
  contacts: string;
  chordchart: string;
  heatmap: string;
}

async function getClusters(
  jobid: number,
  moduleIndex: number,
  bartenderToken: string
) {
  const outputFiles = await listOutputFiles(jobid, bartenderToken, 1);
  const [moduleName, , moduleIndexPadding] = moduleInfo(
    outputFiles,
    moduleIndex
  );

  const modulePath = buildPath({
    moduleIndex,
    moduleName,
    moduleIndexPadding,
  });
  const moduleOuputFiles = await listFilesAt(jobid, modulePath, bartenderToken);
  if (!moduleOuputFiles.children || moduleOuputFiles.children.length < 3) {
    throw new Error("No contactmap files found");
  }
  const nrClusters = (moduleOuputFiles.children.length - 2) / 3;
  const clusters: ContactMapCluster[] = [];
  const prefix = "../../files/output";
  for (let i = 1; i <= nrClusters; i++) {
    const contacts = buildPath({
      prefix,
      moduleIndex,
      moduleName,
      moduleIndexPadding,
      suffix: `cluster${i}_contacts.tsv`,
    });
    const chordchart = buildPath({
      prefix,
      moduleIndex,
      moduleName,
      moduleIndexPadding,
      suffix: `cluster${i}_contmap_chordchart.html`,
    });
    const heatmap = buildPath({
      prefix,
      moduleIndex,
      moduleName,
      moduleIndexPadding,
      suffix: `cluster${i}_contmap_heatmap.html`,
    });
    const cluster = {
      contacts,
      chordchart,
      heatmap,
    };
    clusters.push(cluster);
  }
  return clusters;
}

export const loader = async ({ params, request }: LoaderArgs) => {
  const jobid = jobIdFromParams(params);
  const moduleIndex = parseInt(params.module ?? "-1");
  const bartenderToken = await getBartenderToken(request);
  const job = await getJobById(jobid, bartenderToken);
  if (!CompletedJobs.has(job.state)) {
    throw new Error("Job is not completed");
  }

  const clusters = await getClusters(jobid, moduleIndex, bartenderToken);
  return json({ moduleIndex, clusters, jobid });
};

function RemotePlot({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  return <iframe width={width} height={height} src={src} title="Contact map" />;
}

export default function ContactMapPage() {
  const { moduleIndex, clusters, jobid } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-2xl">Contact map of module {moduleIndex}</h2>
      <div className="pb-4">
        <a
          title="Browse"
          href={`/jobs/${jobid}/browse`}
          className="btn-outline btn btn-sm"
        >
          Back to browse
        </a>
      </div>
      {clusters.map((cluster, i) => (
        <details key={i} open={i === 0}>
          <summary className="text-xl">Cluster {i + 1}</summary>

          <div>
            {/* 
                    TODO improve so not all html files are loaded by browser when this page is opened 
                    TODO haddock3 contactmap should not include js, but fetch it from Internet
                    */}
            <RemotePlot src={cluster.chordchart} width={600} height={600} />
            <RemotePlot src={cluster.heatmap} width={1000} height={1000} />
            <a
              target="_blank"
              rel="noreferrer"
              title="Archive of module output"
              href={`${cluster.contacts}`}
            >
              &#128230;&nbsp;Contacts
            </a>
          </div>
        </details>
      ))}
    </>
  );
}
