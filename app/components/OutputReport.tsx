import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export const OutputReport = ({
  jobid,
  files,
}: {
  jobid: number;
  files: DirectoryItem;
}) => {
  const modules = useMemo(() => {
    if (!files.children) {
      return [];
    }
    const analyisRoot = files.children.find((i) => i.name === "analysis");
    const dataRoot = files.children.find((i) => i.name === "data");

    const nonmodules = new Set(["analysis", "data", "log"]);
    return files.children
      .filter((i) => !nonmodules.has(i.name))
      .map((module) => {
        const report = analyisRoot?.children
          ?.find((c) => c.name === module.name + "_analysis")
          ?.children?.find((c) => c.name === "report.html");
        const data = dataRoot?.children?.find((c) => c.name === module.name);
        const [moduleid, node] = module.name.split("_");
        return {
          moduleid,
          node,
          module,
          data,
          report,
        };
      });
  }, [files]);
  return (
    <div>
      <ul className="list-outside">
        {modules.map((module) => (
          <li key={module.moduleid} className="w-96 p-2 shadow-md">
            <div className="flex grow flex-row justify-between">
              <div>
                {module.moduleid}&nbsp;{module.node}
              </div>
              <div>
                {module.report && (
                  <a
                    title="Analysis report"
                    target="_blank"
                    rel="noreferrer"
                    href={`/jobs/${jobid}/files/${module.report.path}`}
                  >
                    &#128202;
                  </a>
                )}
                <a
                  target="_blank"
                  rel="noreferrer"
                  title="Archive of module"
                  href={`/jobs/${jobid}/archive/${module.module.path}`}
                >
                  &#128230;
                </a>
              </div>
              {/* TODO do we want to show individual files for example output/15_caprieval/capri_clt.tsv? */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
