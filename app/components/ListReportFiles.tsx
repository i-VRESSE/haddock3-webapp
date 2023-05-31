import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export function ListReportFiles({
  files,
  prefix,
}: {
  files: DirectoryItem;
  prefix: string;
}) {
  const reportFiles = useMemo(() => {
    const result = new Map<string, string>();
    if (!files.children) {
      return result;
    }
    const analyisRoot = files.children.find((i) => i.name === "analysis");
    if (!analyisRoot || !analyisRoot.children) {
      return result;
    }
    analyisRoot.children
      .filter((module) => module.children !== undefined)
      .forEach((module) => {
        const html = module.children?.find(
          (file) => file.name === "report.html"
        );
        if (html !== undefined) {
          result.set(module.name, html.path);
        }
      });
    return result;
  }, [files]);

  return (
    <ul className="list-disc list-inside">
      {Array.from(reportFiles).map(([module, report]) => (
        <li key={module}>
          <a target="_blank" rel="noreferrer" href={`${prefix}${report}`}>
            {module}
          </a>
        </li>
      ))}
    </ul>
  );
}
