import type { Layout, Data, LayoutAxis, AxisName } from "plotly.js";
import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Scores } from "./CaprievalReport.client";

// TODO move component to https://github.com/i-VRESSE/haddock3-analysis-components

const AXIS_NAMES = {
  score: "HADDOCK score [a.u.]",
  vdw: "Van der Waals Energy",
  elec: "Electrostatic Energy",
  air: "Restraints Energy",
  desolv: "Desolvation Energy",
  irmsd: "interface RMSD [A]",
  lrmsd: "ligand RMSD [A]",
  ilrmsd: "interface-ligand RMSD [A]",
  fnat: "Fraction of Common Contacts",
  dockq: "DOCKQ",
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

const NR_COLS = 5;
const DOMAINS = {
  columns: [
    [0.0, 0.152],
    [0.212, 0.364],
    [0.424, 0.576],
    [0.636, 0.788],
    [0.848, 1.0],
  ],
  rows: [
    [0, 0.4],
    [0.6, 1.0],
  ],
};

const MAX_CLUSTER_TO_PLOT = 10;

type BoxData = Data & { notched: boolean };

function generateSubPlots(scores: Scores): BoxData[] {
  const data: BoxData[] = [];
  let aIndex = 1;
  for (const aname of Object.keys(AXIS_NAMES)) {
    const xaxis = "x" + (aIndex === 1 ? "" : aIndex);
    const yaxis = "y" + (aIndex === 1 ? "" : aIndex);
    const other: BoxData = {
      alignmentgroup: "True",
      boxpoints: "outliers",
      hovertemplate:
        "Cluster Rank=Other<br>capri_rank=%{x}<br>score=%{y}<br>caprieval_rank=%{customdata[0]}<extra></extra>",
      legendgroup: "Other",
      marker: { color: "#DDDBDA" },
      name: "Other",
      notched: false,
      offsetgroup: "Other",
      orientation: "v",
      showlegend: aIndex === 1,
      customdata: [],
      x: [],
      x0: " ",
      xaxis,
      y: [],
      y0: " ",
      yaxis,
      type: "box",
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
          alignmentgroup: "True",
          boxpoints: "outliers",
          customdata: structures4cluster.map((s) => [s.caprieval_rank]),
          hovertemplate: `Cluster Rank=${cluster.cluster_rank}<br>capri_rank=%{x}<br>score=%{y}<br>caprieval_rank=%{customdata[0]}<extra></extra>`,
          legendgroup: name,
          marker: {
            color,
          },
          name,
          notched: false,
          offsetgroup: "-",
          orientation: "v",
          showlegend: aIndex === 1,
          x: structures4cluster.map((s) => s["cluster-ranking"]),
          x0: " ",
          xaxis,
          y: structures4cluster.map((s) => s[aname]),
          y0: " ",
          yaxis,
          type: "box",
        });
      } else {
        other.customdata = (other.customdata as Array<string | number>).concat(
          structures4cluster.map((s) => s.caprieval_rank)
        );
        other.x = (other.x as Array<string | number>).concat(
          structures4cluster.map(() => MAX_CLUSTER_TO_PLOT + 1)
        );
        other.y = (other.y as Array<string | number>).concat(
          structures4cluster.map((s) => s[aname])
        );
      }
    }
    if (other.x!.length > 0) {
      data.push(other);
    }
    aIndex++;
  }

  console.log(data);
  return data;
}

function generateAxes() {
  const axes: Record<string, Partial<LayoutAxis & { matches: string }>> = {};
  let aIndex = 1;
  // TODO make nr columns depend on nr clusters

  for (const label of Object.values(AXIS_NAMES)) {
    const xaxisKey = "xaxis" + (aIndex === 1 ? "" : aIndex);
    const yaxisKey = "yaxis" + (aIndex === 1 ? "" : aIndex);
    const ax = ("x" + (aIndex === 1 ? "" : aIndex)) as AxisName;
    const ay = ("y" + (aIndex === 1 ? "" : aIndex)) as AxisName;
    const rowi = Math.floor((aIndex - 1) / NR_COLS);
    const coli = (aIndex - 1) % NR_COLS;
    const domainx = DOMAINS.columns[coli];
    const domainy = DOMAINS.rows[rowi];
    axes[xaxisKey] = {
      anchor: ay,
      domain: domainx,
      title: {
        text: "Cluster Rank",
        standoff: 5,
      },
      automargin: true,
    };
    if (aIndex > 1) {
      axes[xaxisKey].matches = "x";
    }
    axes[yaxisKey] = {
      anchor: ax,
      domain: domainy,
      title: {
        text: label,
        standoff: 5,
      },
      automargin: true,
    };
    aIndex++;
  }

  return axes;
}

export function BoxPlots({ scores }: { scores: Scores }) {
  const data = useMemo(() => generateSubPlots(scores), [scores]);
  const axes = useMemo(() => generateAxes(), []);
  // TODO add button to focus on single subplot
  const nr_cluster = scores.clusters.length;
  const sph = nr_cluster > 5 ? 300 : 300;
  const spw = nr_cluster > 5 ? 350 : 350;
  const width = spw * NR_COLS;
  const height =
    sph * (Math.ceil(Object.keys(AXIS_NAMES).length / NR_COLS) + 1);
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
