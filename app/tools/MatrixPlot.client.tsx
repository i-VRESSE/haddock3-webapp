import { Data, Layout } from "plotly.js";
import { PlotlyPlot } from "~/components/PlotlyPlot";

export function MatrixPlot(props: { data: Data[]; layout: Layout }) {
  return (
    <div>
      <PlotlyPlot data={props.data} layout={props.layout} />
    </div>
  );
}
