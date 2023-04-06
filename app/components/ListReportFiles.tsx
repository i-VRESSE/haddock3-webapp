import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export function ListReportFiles({ files, prefix }: { files: DirectoryItem, prefix: string }) {
  const htmlFiles: [string, DirectoryItem[]][] = useMemo(() => {
    if (!files.children) {
      return [];
    }
    const analyisRoot = files.children.find((i) => i.name === "analysis");
    if (!analyisRoot|| !analyisRoot.children) {
      return [];
    }
    return analyisRoot.children.map((module) => {
      if (!module.children) {
        return [module.name, []]
      }
      const htmls = module.children.filter((file) => file.name.endsWith("report.html"))
        .map((file) => file);
      return [module.name, htmls];
    });
  }, [files]);
  return (
    <ul className="list-disc list-inside">
      {htmlFiles.map(([module, htmls]) => {
        return <li key={module}><a href={`${prefix}${htmls[0].path}`}>{module}</a></li>;
      })}
    </ul>
  );
}
