import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

export interface PlotlyProps {
  data: Data[];
  layout: Layout;
}

export function PlotlyPlot(props: PlotlyProps) {
  return (
    <Plot
      data={props.data}
      layout={props.layout}
      config={{
        responsive: true,
      }}
    />
  );
}
