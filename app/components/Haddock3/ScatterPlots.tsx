import type { Scores } from "./CaprievalReport.client";
import type { Layout, Data } from "plotly.js";
import { useMemo } from "react";
import Plot from "react-plotly.js";

const SCATTER_AXES = {
  x: ["score", "desolv", "vdw", "elec", "air"],
  y: ["irmsd", "dockq", "lrmsd", "ilrmsd"],
};

export function generateSubPlots(scores: Scores, axes = SCATTER_AXES): Data[] {
  const data: Data[] = [];
  for (const x of axes.x) {
    const xaxis = axes.x.indexOf(x) == 0 ? "x" : "x" + (axes.x.indexOf(x) + 1);
    for (const y of axes.y) {
      const yaxis =
        axes.y.indexOf(y) == 0 ? "y" : "y" + (axes.y.indexOf(y) + 1);
      scores.clusters.forEach((cluster) => {
        const structures4cluster = scores.structures.filter(
          (s) => s["cluster-id"] === cluster.cluster_id
        );
        const name = cluster.cluster_id === "-" ? "Unclustered" : cluster.cluster_id + ""
        data.push({
          x: structures4cluster.map((s) => s[x]),
          y: structures4cluster.map((s) => s[y]),
          name,
          legendgroup: name,
          mode: "markers",
          type: "scatter",
          // "Model: mdscoring_17.pdb<br>Score: -13.82<br>Caprieval rank: 16",
          text: structures4cluster.map(
            (s) =>
              `Model: ${s.model}<br>Score: ${s.score}<br>Caprieval rank: ${s.caprieval_rank}`
          ),
          xaxis,
          yaxis,
        });
        data.push({
            error_x: {
                array: [cluster[x + "_std"]],
                type: "data",
                visible: true,
            },
            error_y: {
                array: [cluster[y + "_std"]],
                type: "data",
                visible: true,
            },
            x: [cluster[x]],
            y: [cluster[y]],
            marker: { color: "#2E91E5", size: 10, symbol: "square-dot" },
            legendgroup: name,
            mode: "markers",
            showlegend: false,
            type: "scatter",
            xaxis,
            yaxis,
        })
      });
    }
  }
  

  return data;
}

export function ScatterPlots({ scores }: { scores: Scores }) {
  const data = useMemo(() => generateSubPlots(scores), [scores]);
  const subplots = [
    ["xy", "x2y", "x3y", "x4y", "x5y"],
    ["xy2", "x2y2", "x3y2", "x4y2", "x5y2"],
    ["xy3", "x2y3", "x3y3", "x4y3", "x5y3"],
    ["xy4", "x2y4", "x3y4", "x4y4", "x5y4"],
  ] as any;
  const layout: Partial<Layout> = {
    width: 1400,
    height: 1750,
    grid: {
      rows: 4,
      columns: 5,
      pattern: "coupled",
      subplots,
      roworder: "bottom to top",
    },
  };
  return <Plot data={data} layout={layout} />;
}
