import { useSaveWithGlobalRewrite } from "@i-vresse/wb-core/dist/store";
import { Download } from "lucide-react";
import { JOB_OUTPUT_DIR } from "~/bartender-client/constants";
import { Button } from "~/components/ui/button";

export const DownloadButton = (): JSX.Element => {
  const save = useSaveWithGlobalRewrite((current) => {
    return {
      ...current,
      run_dir: JOB_OUTPUT_DIR,
    };
  });

  return (
    <Button variant="ghost" onClick={save} title="Download an archive">
      <Download />
    </Button>
  );
};
