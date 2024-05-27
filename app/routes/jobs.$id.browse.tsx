import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getBartenderToken } from "~/bartender-client/token.server";
import {
  listOutputFiles,
  listInputFiles,
  jobIdFromParams,
  getCompletedJobById,
} from "~/models/job.server";
import { JobStatus } from "~/components/JobStatus";
import { ListFiles } from "~/browse/ListFiles";
import { NonModuleOutputFiles } from "~/browse/NonModuleOutputFiles";
import { OutputReport } from "~/browse/OutputReport";
import {
  buildBestRankedPath,
  getLastCaprievalModule,
} from "~/caprieval/caprieval.server";
import { Button } from "~/components/ui/button";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { prefix } from "~/prefix";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const jobId = jobIdFromParams(params);
  const token = await getBartenderToken(request);
  const job = await getCompletedJobById(jobId, token);
  const inputFiles = await listInputFiles(jobId, token);
  const outputFiles = await listOutputFiles(jobId, token);
  let hasCaprieval = true;
  let bestRanked = "";
  try {
    const [moduleIndex, moduleIndexPadding] =
      getLastCaprievalModule(outputFiles);
    bestRanked = buildBestRankedPath(moduleIndex, moduleIndexPadding);
  } catch (error) {
    hasCaprieval = false;
  }

  return json({ job, inputFiles, outputFiles, hasCaprieval, bestRanked });
};

export default function JobPage() {
  const { job, outputFiles, inputFiles, hasCaprieval, bestRanked } =
    useLoaderData<typeof loader>();

  const hasWorkflow = inputFiles.children?.some(
    (file) => file.is_file && file.name === WORKFLOW_CONFIG_FILENAME,
  );
  return (
    <main className="flex flex-row gap-16">
      <div>
        <JobStatus job={job} />
        {hasCaprieval && job.state === "ok" && (
          <>
            <p>
              <a
                title="Download archive of best ranked clusters/structures"
                href={`${prefix}jobs/${job.id}/files/${bestRanked}`}
              >
                🏆 Download best ranked
              </a>
            </p>
            <Button className="mt-8" variant="outline" size="xl" asChild>
              <Link to={`/jobs/${job.id}/report`}>👁 Report</Link>
            </Button>
          </>
        )}
      </div>
      <div>
        <h2 className="text-2xl">Input</h2>
        <ListFiles files={inputFiles!} jobid={job.id} />
        <p>
          <a href={`${prefix}jobs/${job.id}/input.zip`}>
            &#128230; Download archive
          </a>
        </p>
        {hasWorkflow && (
          <p>
            <Link to={`${prefix}jobs/${job.id}/edit`}>&#128393; Edit</Link>
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xl">Module output</h2>
        <OutputReport
          files={outputFiles!}
          jobid={job.id}
          withTools={job.state === "ok"}
        />
        <a href={`${prefix}jobs/${job.id}/output.zip`}>
          &#128230; Download archive
        </a>
      </div>
      <div>
        <h2 className="text-xl">Other output files</h2>
        <NonModuleOutputFiles files={outputFiles} jobid={job.id} />
      </div>
    </main>
  );
}
