import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";
import { ListFiles } from "./ListFiles";

export function files2modules(files: DirectoryItem) {
  if (!files.children) {
    return [];
  }
  const analyisRoot = files.children.find((i) => i.name === "analysis");

  const nonmodules = new Set(["analysis", "data", "log"]);
  return files.children
    .filter((i) => !nonmodules.has(i.name))
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
}: {
  jobid: number;
  files: DirectoryItem;
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
                  title="Archive of module output"
                  href={`/jobs/${jobid}/archive/${module.output.path}`}
                >
                  &#128230;
                </a>
              </div>
            </div>
            <details>
              <summary>Files</summary>
              {/* TODO should we hide io.json and params.cfg? */}
              <ListFiles files={module.output} jobid={jobid} />
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};
