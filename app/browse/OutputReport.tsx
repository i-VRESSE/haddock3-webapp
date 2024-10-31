import { useMemo } from "react";

import { ListFiles } from "./ListFiles";
import type { DirectoryItem } from "~/bartender-client/types";
import { Link } from "@remix-run/react";
import { prefix } from "~/prefix";

export function files2modules(files: DirectoryItem) {
  if (!files.children) {
    return [];
  }
  const analyisRoot = files.children.find((i) => i.name === "analysis");

  const nonmodules = new Set(["analysis", "data", "log", "traceback"]);
  return files.children
    .filter(
      (i) =>
        i.is_dir && !nonmodules.has(i.name) && !i.name.endsWith("_interactive"),
    )
    .map((output) => {
      const report = analyisRoot?.children
        ?.find((c) => c.name === output.name + "_analysis")
        ?.children?.find((c) => c.name === "report.html");
      const [id, name] = output.name.split("_");
      return {
        id,
        name,
        output,
        report,
      };
    });
}

export const OutputReport = ({
  jobid,
  files,
  withTools,
}: {
  jobid: number;
  files: DirectoryItem;
  withTools?: boolean;
}) => {
  const modules = useMemo(() => {
    return files2modules(files);
  }, [files]);
  return (
    <div>
      <ul className="list-outside">
        {modules.map((module) => (
          <li key={module.id} className="w-96 p-2 shadow-md">
            <div className="flex grow flex-row justify-between">
              <div>
                {module.id}&nbsp;{module.name}
              </div>
              <div>
                {module.name === "clustfcc" && withTools && (
                  <Link
                    title="Recluster"
                    to={`/jobs/${jobid}/tools/reclustfcc/${module.id}`}
                  >
                    🔧
                  </Link>
                )}
                {module.name === "clustfcc" && (
                  <a
                    title="Cluster matrix plot"
                    target="_blank"
                    rel="noreferrer"
                    // http://0.0.0.0:3000/jobs/5/files/output/09_clustfcc/fcc_matrix.html
                    href={`${prefix}jobs/${jobid}/files/output/${module.id}_${module.name}/fcc_matrix.html`}
                    className="dark:invert"
                  >
                    &#128202;
                  </a>
                )}
                {module.name === "clustrmsd" && withTools && (
                  <Link
                    title="Recluster"
                    to={`/jobs/${jobid}/tools/reclustrmsd/${module.id}`}
                  >
                    🔧
                  </Link>
                )}
                {module.name === "clustrmsd" && (
                  <a
                    title="Cluster matrix plot"
                    target="_blank"
                    rel="noreferrer"
                    // http://0.0.0.0:3000/jobs/5/files/output/09_clustrmsd/rmsd_matrix.html
                    href={`${prefix}jobs/${jobid}/files/output/${module.id}_${module.name}/rmsd_matrix.html`}
                    className="dark:invert"
                  >
                    &#128202;
                  </a>
                )}
                {module.name === "caprieval" && withTools && (
                  <Link
                    title="Rescore"
                    to={`/jobs/${jobid}/tools/rescore/${module.id}`}
                  >
                    🔧
                  </Link>
                )}
                {module.name === "contactmap" && withTools && (
                  <Link
                    title="Contact map report"
                    to={`/jobs/${jobid}/analysis/contactmap/${module.id}`}
                    className="dark:invert"
                  >
                    &#128208;
                  </Link>
                )}
                {module.name === "alascan" && withTools && (
                  <Link
                    title="Alanine scan report"
                    to={`/jobs/${jobid}/analysis/alascan/${module.id}`}
                    className="dark:invert"
                  >
                    &#128208;
                  </Link>
                )}
                {module.report && withTools && (
                  <>
                    <a
                      title="Caprieval analysis report"
                      target="_blank"
                      rel="noreferrer"
                      href={`${prefix}jobs/${jobid}/files/${module.report.path}`}
                      className="dark:invert"
                    >
                      &#128202;
                    </a>
                    <a
                      title="Download archive of best ranked clusters/structures"
                      href={`${prefix}jobs/${jobid}/files/${module.report.path}/../summary.tgz`}
                    >
                      🏆
                    </a>
                  </>
                )}
                <a
                  title="Archive of module output"
                  href={`${prefix}jobs/${jobid}/archive/${module.output.path}`}
                >
                  &#128230;
                </a>
              </div>
            </div>
            <details>
              <summary className="cursor-pointer">Files</summary>
              <ListFiles files={module.output} jobid={jobid} />
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};
