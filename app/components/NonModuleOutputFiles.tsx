import type { components } from "../bartender-client/bartenderschema";
import { ListFiles } from "./ListFiles";
import { useMemo } from "react";

type DirectoryItem = components["schemas"]["DirectoryItem"];

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
