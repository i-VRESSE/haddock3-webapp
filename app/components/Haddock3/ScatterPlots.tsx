import { CAPRIEVAL_SCATTERPLOT_CHOICES } from "~/models/constants";
import type { PlotlyProps } from "../PlotlyPlot";
import { PlotlyPlot } from "../PlotlyPlot";

export function ScatterPlots({
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
          {Object.entries(CAPRIEVAL_SCATTERPLOT_CHOICES).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
      </label>
    </>
  );
}
