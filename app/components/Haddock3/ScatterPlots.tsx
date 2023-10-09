import type { Layout, Data, LayoutAxis, AxisName } from "plotly.js";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Scores } from "./CaprievalReport.client";

// TODO move component to https://github.com/i-VRESSE/haddock3-analysis-components

const SUBPLOTS = {
  columns: ["score", "desolv", "vdw", "elec", "air"],
  rows: ["irmsd", "dockq", "lrmsd", "ilrmsd"].reverse(),
};

const DOMAINS = {
  columns: [
    [0.0, 0.152],
    [0.212, 0.364],
    [0.424, 0.576],
    [0.636, 0.788],
    [0.848, 1.0],
  ],
  rows: [
    [0, 0.175],
    [0.275, 0.45],
    [0.55, 0.725],
    [0.825, 1.0],
  ],
};

const TITLE_NAMES = {
  score: "HADDOCK score",
  irmsd: "i-RMSD",
  lrmsd: "l-RMSD",
  ilrmsd: "il-RMSD",
  dockq: "DOCKQ",
  desolv: "Edesolv",
  vdw: "Evdw",
  elec: "Eelec",
  air: "Eair",
  fnat: "FCC",
};

// TODO dont duplicate this, but get from d3
// Dark24 from venv/lib/python3.10/site-packages/_plotly_utils/colors/qualitative.py
const CLUSTER_COLORS = [
  "#2E91E5",
  "#E15F99",
  "#1CA71C",
  "#FB0D0D",
  "#DA16FF",
  "#222A2A",
  "#B68100",
  "#750D86",
  "#EB663B",
  "#511CFB",
  "#00A08B",
  "#FB00D1",
  "#FC0080",
  "#B2828D",
  "#6C7C32",
  "#778AAE",
  "#862A16",
  "#A777F1",
  "#620042",
  "#1616A7",
  "#DA60CA",
  "#6C4516",
  "#0D2A63",
  "#AF0038",
];

const MAX_CLUSTER_TO_PLOT = 10;

function generateSubPlots(scores: Scores, axes = SUBPLOTS): Data[] {
  const data: Data[] = [];
  let aIndex = 1;
  for (const row of axes.rows) {
    for (const column of axes.columns) {
      generateSubPlot(aIndex, scores, row, column, data);
      aIndex++;
    }
  }
  // console.log(data);

  return data;
}

function generateSubPlot(
  aIndex: number,
  scores: Scores,
  row: string,
  column: string,
  data: Data[]
) {
  const xaxis = "x" + (aIndex === 1 ? "" : aIndex);
  const yaxis = "y" + (aIndex === 1 ? "" : aIndex);
  const other: Data = {
    xaxis,
    yaxis,
    type: "scatter",
    mode: "markers",
    marker: { color: "white", line: { color: "DarkSlateGrey", width: 2 } },
    name: "Other",
    legendgroup: "Other",
    showlegend: aIndex === 1,
    hoverlabel: {
      bgcolor: "white",
      font: { family: "Helvetica", size: 16 },
    },
    text: [],
    x: [],
    y: [],
  };
  for (const cluster of scores.clusters) {
    const structures4cluster = scores.structures.filter(
      (s) => s["cluster-id"] === cluster.cluster_id
    );
    if (
      cluster.cluster_rank === "-" ||
      Number(cluster.cluster_rank) <= MAX_CLUSTER_TO_PLOT
    ) {
      const color =
        CLUSTER_COLORS[
          cluster.cluster_rank === "-" ? 0 : Number(cluster.cluster_rank) - 1
        ];
      const name =
        "Cluster " +
        (cluster.cluster_rank === "-"
          ? "Unclustered"
          : cluster.cluster_rank + "");
      data.push({
        x: structures4cluster.map((s) => s[row]),
        y: structures4cluster.map((s) => s[column]),
        name,
        legendgroup: name,
        hoverlabel: {
          bgcolor: color,
          font: { family: "Helvetica", size: 16 },
        },
        showlegend: aIndex === 1,
        marker: { color },
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
      // Error bars
      data.push({
        error_x: {
          array: [cluster[row + "_std"]],
          type: "data",
          visible: true,
        },
        error_y: {
          array: [cluster[column + "_std"]],
          type: "data",
          visible: true,
        },
        x: [cluster[row]],
        y: [cluster[column]],
        marker: { color, size: 10, symbol: "square-dot" },
        text: [
          `Cluster ${cluster.cluster_id}<br>${column}: ${cluster[column]}<br>${row}: ${cluster[row]}`,
        ],
        hoverlabel: {
          bgcolor: color,
          font: { family: "Helvetica", size: 16 },
        },
        hovertemplate: `<b>Cluster ${cluster.cluster_id}<br>${column}: ${cluster[column]}<br>${row}: ${cluster[row]}</b><extra></extra>`,
        legendgroup: name,
        mode: "markers",
        showlegend: false,
        type: "scatter",
        xaxis,
        yaxis,
      });
    } else {
      // Fill other cluster
      other.x = (other.x as Array<string | number>).concat(
        structures4cluster.map((s) => s[row])
      );
      other.y = (other.y as Array<string | number>).concat(
        structures4cluster.map((s) => s[column])
      );
      other.text = (other.text as Array<string>).concat(
        structures4cluster.map(
          (s) =>
            `Model: ${s.model}<br>Score: ${s.score}<br>Caprieval rank: ${s.caprieval_rank}`
        )
      );
    }
  }
  if (other.x!.length > 0) {
    data.push(other);
  }
}

function generateAxes() {
  const axes: Record<string, Partial<LayoutAxis & { matches: string }>> = {};
  let aIndex = 1;
  for (const row of SUBPLOTS.rows) {
    for (const column of SUBPLOTS.columns) {
      generatePlotAxes(aIndex, column, row, axes);
      aIndex++;
    }
  }
  // console.log(JSON.stringify(axes,null,2));
  return axes;
}

function generatePlotAxes(
  aIndex: number,
  column: string,
  row: string,
  axes: Record<string, Partial<LayoutAxis & { matches: string }>>
) {
  const xaxisKey = "xaxis" + (aIndex === 1 ? "" : aIndex);
  const yaxisKey = "yaxis" + (aIndex === 1 ? "" : aIndex);
  const ax = ("x" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const ay = ("y" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const colindex = SUBPLOTS.columns.indexOf(column);
  const rowindex = SUBPLOTS.rows.indexOf(row);
  const mx =
    rowindex === 0 ? "x" : "x" + (rowindex + 1) * SUBPLOTS.columns.length;
  const my = colindex === 0 ? "y" : "y" + (colindex + 1);
  axes[xaxisKey] = {
    anchor: ay,
    domain: DOMAINS.columns[colindex],
    title: {
      text: TITLE_NAMES[row as keyof typeof TITLE_NAMES],
      standoff: 5,
    },
    automargin: true,
  };
  axes[yaxisKey] = {
    anchor: ax,
    domain: DOMAINS.rows[rowindex],
    title: {
      text: TITLE_NAMES[column as keyof typeof TITLE_NAMES],
      standoff: 5,
    },
    automargin: true,
  };
  if (mx !== ax) {
    axes[xaxisKey].matches = mx;
  }
  if (my !== ay) {
    axes[yaxisKey].matches = my;
  }
}

export function ScatterPlots({ scores }: { scores: Scores }) {
  const data = useMemo(() => generateSubPlots(scores), [scores]);
  const axes = useMemo(() => generateAxes(), []);
  // TODO add button to focus on single subplot
  const nr_cluster = scores.clusters.length;
  const sph = nr_cluster > 5 ? 300 : 300;
  const spw = nr_cluster > 5 ? 350 : 350;
  const width = spw * SUBPLOTS.columns.length;
  const height = sph * SUBPLOTS.rows.length;

  const layout: Partial<Layout> = {
    height,
    width,
    legend: { title: { text: "Cluster Rank" } },
    ...axes,
  };
  return (
    <Plot
      data={data}
      layout={layout}
      config={{
        responsive: true,
      }}
    />
  );
}
