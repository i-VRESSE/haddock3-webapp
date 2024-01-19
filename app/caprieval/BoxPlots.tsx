import type { PlotlyProps } from "../components/PlotlyPlot";
import { PlotlyPlot } from "../components/PlotlyPlot";
import { CAPRIEVAL_BOXPLOT_CHOICES } from "./constants";

export function BoxPlots({
  data,
  layout,
  selected,
  onChange,
}: {
  data: PlotlyProps["data"];
  layout: PlotlyProps["layout"];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <PlotlyPlot data={data} layout={layout} />
      <label>
        Enlarge a subplot{" "}
        <select value={selected} onChange={(e) => onChange(e.target.value)}>
          {Object.entries(CAPRIEVAL_BOXPLOT_CHOICES).map(([value, label]) => (
            <option key={value} value={value}>
              {label} vs Cluster Rank
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
