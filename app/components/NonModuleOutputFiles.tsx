import type { DirectoryItem } from "~/bartender-client";
import { ListFiles } from "./ListFiles";

const nonmodules = new Set(["analysis", "data", "traceback"]);

export function NonModuleOutputFiles({
    jobid,
    files,
  }: {
    jobid: number;
    files: DirectoryItem;
  }) {
    const filtered_files = {
        ...files,
        children: files.children?.filter((i) => nonmodules.has(i.name))
    }

    return <ListFiles files={filtered_files} jobid={jobid} />
}