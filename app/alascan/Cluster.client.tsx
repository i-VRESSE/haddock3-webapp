import { PlotlyPlot } from "~/components/PlotlyPlot";
import type { ClusterInfo } from "./alascan.server";

export function Cluster({ info }: { info: ClusterInfo }) {
  return (
    <div>
      <PlotlyPlot data={info.plot.data} layout={info.plot.layout} />
      <div className="flex flex-row gap-4">
        <span>Download:</span>
        <a className="hover:underline" href={info.csv}>
          CSV
        </a>
      </div>
      {/* TODO show cluster_*_model_*_alascan.pdb.gz files in 3D viewer */}
      {/* TODO show z_scores from scan_cluster_*_model_*.csv in 3D viewer */}
      {/* TODO download links for scan_cluster_*_model_*.csv  */}
    </div>
  );
}
