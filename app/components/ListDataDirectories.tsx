import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export function ListDataDirectories({
  files,
  prefix,
}: {
  files: DirectoryItem;
  prefix: string;
}) {
  const dataDirs = useMemo(() => {
    if (!files.children) {
      return [];
    }
    const dataRoot = files.children.find((i) => i.name === "data");
    if (!dataRoot || !dataRoot.children) {
      return;
    }
    return dataRoot.children;
  }, [files]);
  return (
    <ul className="list-inside list-disc">
      {dataDirs?.map((d) => (
        <li key={d.path}>
          <span>{d.name}</span>
          <ul className="list-inside list-disc">
            {d.children?.map((c) => (
              <li className="ml-4" key={c.path}>
                <a target="_blank" rel="noreferrer" href={`${prefix}${c.path}`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
