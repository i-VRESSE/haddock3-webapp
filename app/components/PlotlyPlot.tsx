import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";
import './plotly-override.css';

export interface PlotlyProps {
  data: Data[];
  layout: Layout;
}

let Plot2 = Plot;
if (typeof Plot === "object") {
  // Remix dev+prod bundlers import Plot as {default: Plot} so we need to extract the default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Plot2 = (Plot as { default: any }).default;
}

export function PlotlyPlot(props: PlotlyProps) {
  return (
    <Plot2
      data={props.data}
      layout={props.layout}
      config={{
        responsive: true,
      }}
    />
  );
}
