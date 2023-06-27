import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export const OutputReport = ({
  jobid,
  files,
}: {
  jobid: number;
  files: DirectoryItem;
}) => {
  const steps = useMemo(() => {
    if (!files.children) {
      return [];
    }
    const analyisRoot = files.children.find((i) => i.name === "analysis");
    const dataRoot = files.children.find((i) => i.name === "data");

    const nonSteps = new Set(["analysis", "data", "log"]);
    return files.children
      .filter((i) => !nonSteps.has(i.name))
      .map((step) => {
        const report = analyisRoot?.children
          ?.find((c) => c.name === step.name + "_analysis")
          ?.children?.find((c) => c.name === "report.html");
        const data = dataRoot?.children?.find((c) => c.name === step.name);
        const [stepid, node] = step.name.split("_");
        return {
          stepid,
          node,
          step,
          data,
          report,
        };
      });
  }, [files]);
  return (
    <div>
      <ul className="list-outside">
        {steps.map((step) => (
          <li key={step.stepid} className="shadow-md w-96 p-2">
              <div className="flex flex-row grow justify-between">
                <div>{step.stepid}&nbsp;{step.node}</div>
                <div>
                {step.report && (
                  <a
                    title="Analysis report"
                    target="_blank"
                    rel="noreferrer"
                    href={`/jobs/${jobid}/files/${step.report.path}`}
                  >
                    &#128202;
                  </a>
                )}
                <a
                  target="_blank"
                  rel="noreferrer"
                  title="Archive of step"
                  href={`/jobs/${jobid}/archive/${step.step.path}`}
                >
                  &#128230;
                </a>
                </div>
              </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
