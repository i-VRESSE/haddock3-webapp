import type { DirectoryItem } from "~/bartender-client";
import { ListFiles } from "./ListFiles";
import { useMemo } from "react";

const nonmodules = new Set(["analysis", "data", "traceback"]);

export function NonModuleOutputFiles({
  jobid,
  files,
}: {
  jobid: number;
  files: DirectoryItem;
}) {
  const filtered_files = useMemo(() => {
    return {
      ...files,
      children: files.children?.filter((i) => nonmodules.has(i.name)),
    };
  }, [files]);

  return <ListFiles files={filtered_files} jobid={jobid} />;
}
