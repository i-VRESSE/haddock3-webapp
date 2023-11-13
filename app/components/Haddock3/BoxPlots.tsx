import type { Layout, Data, LayoutAxis, AxisName, Template } from "plotly.js";
import { useMemo, useState } from "react";
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
  bsa: "Buried Surface Area [A^2]",
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
    [0.75, 1.0],
    [0.38, 0.62],
    [0.0, 0.24],
  ],
};

const MAX_CLUSTER_TO_PLOT = 10;

type BoxData = Data & { notched: boolean };

function generateSubPlots(scores: Scores): BoxData[] {
  const data: BoxData[] = [];
  let aIndex = 1;
  for (const aname of Object.keys(AXIS_NAMES)) {
    generateSubPlot(aIndex, scores, data, aname);
    aIndex++;
  }

  return data;
}

function generateSubPlot(
  aIndex: number,
  scores: Scores,
  data: BoxData[],
  aname: string
) {
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
        y: structures4cluster.map((s) => s[aname as keyof typeof s]),
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
        structures4cluster.map((s) => s[aname as keyof typeof s])
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
  // TODO make nr columns depend on nr clusters

  for (const label of Object.values(AXIS_NAMES)) {
    generateAxesPair(aIndex, axes, label);
    aIndex++;
  }

  return axes;
}

function generateAxesPair(
  aIndex: number,
  axes: Record<string, Partial<LayoutAxis & { matches: string }>>,
  label: string,
  domains = DOMAINS,
  nr_cols = NR_COLS
) {
  const xaxisKey = "xaxis" + (aIndex === 1 ? "" : aIndex);
  const yaxisKey = "yaxis" + (aIndex === 1 ? "" : aIndex);
  const ax = ("x" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const ay = ("y" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const rowi = Math.floor((aIndex - 1) / nr_cols);
  const coli = (aIndex - 1) % nr_cols;
  const domainx = domains.columns[coli];
  const domainy = domains.rows[rowi];
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
}

// Copy of template generated by haddock3-analyse
// TODO trim down to only what is needed
const template = {
  data: {
    histogram2dcontour: [
      {
        type: "histogram2dcontour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    choropleth: [
      {
        type: "choropleth",
        colorbar: { outlinewidth: 0, ticks: "" },
      },
    ],
    histogram2d: [
      {
        type: "histogram2d",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    heatmap: [
      {
        type: "heatmap",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    heatmapgl: [
      {
        type: "heatmapgl",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    contourcarpet: [
      {
        type: "contourcarpet",
        colorbar: { outlinewidth: 0, ticks: "" },
      },
    ],
    contour: [
      {
        type: "contour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    surface: [
      {
        type: "surface",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    mesh3d: [
      {
        type: "mesh3d",
        colorbar: { outlinewidth: 0, ticks: "" },
      },
    ],
    scatter: [
      {
        fillpattern: {
          fillmode: "overlay",
          size: 10,
          solidity: 0.2,
        },
        type: "scatter",
      },
    ],
    parcoords: [
      {
        type: "parcoords",
        line: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scatterpolargl: [
      {
        type: "scatterpolargl",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    bar: [
      {
        error_x: { color: "#2a3f5f" },
        error_y: { color: "#2a3f5f" },
        marker: {
          line: { color: "#E5ECF6", width: 0.5 },
          pattern: {
            fillmode: "overlay",
            size: 10,
            solidity: 0.2,
          },
        },
        type: "bar",
      },
    ],
    scattergeo: [
      {
        type: "scattergeo",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scatterpolar: [
      {
        type: "scatterpolar",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    histogram: [
      {
        marker: {
          pattern: {
            fillmode: "overlay",
            size: 10,
            solidity: 0.2,
          },
        },
        type: "histogram",
      },
    ],
    scattergl: [
      {
        type: "scattergl",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scatter3d: [
      {
        type: "scatter3d",
        line: { colorbar: { outlinewidth: 0, ticks: "" } },
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scattermapbox: [
      {
        type: "scattermapbox",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scatterternary: [
      {
        type: "scatterternary",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    scattercarpet: [
      {
        type: "scattercarpet",
        marker: { colorbar: { outlinewidth: 0, ticks: "" } },
      },
    ],
    carpet: [
      {
        aaxis: {
          endlinecolor: "#2a3f5f",
          gridcolor: "white",
          linecolor: "white",
          minorgridcolor: "white",
          startlinecolor: "#2a3f5f",
        },
        baxis: {
          endlinecolor: "#2a3f5f",
          gridcolor: "white",
          linecolor: "white",
          minorgridcolor: "white",
          startlinecolor: "#2a3f5f",
        },
        type: "carpet",
      },
    ],
    table: [
      {
        cells: {
          fill: { color: "#EBF0F8" },
          line: { color: "white" },
        },
        header: {
          fill: { color: "#C8D4E3" },
          line: { color: "white" },
        },
        type: "table",
      },
    ],
    barpolar: [
      {
        marker: {
          line: { color: "#E5ECF6", width: 0.5 },
          pattern: {
            fillmode: "overlay",
            size: 10,
            solidity: 0.2,
          },
        },
        type: "barpolar",
      },
    ],
    pie: [{ automargin: true, type: "pie" }],
  },
  layout: {
    autotypenumbers: "strict",
    colorway: [
      "#636efa",
      "#EF553B",
      "#00cc96",
      "#ab63fa",
      "#FFA15A",
      "#19d3f3",
      "#FF6692",
      "#B6E880",
      "#FF97FF",
      "#FECB52",
    ],
    font: { color: "#2a3f5f" },
    hovermode: "closest",
    hoverlabel: { align: "left" },
    paper_bgcolor: "white",
    plot_bgcolor: "#E5ECF6",
    polar: {
      bgcolor: "#E5ECF6",
      angularaxis: {
        gridcolor: "white",
        linecolor: "white",
        ticks: "",
      },
      radialaxis: {
        gridcolor: "white",
        linecolor: "white",
        ticks: "",
      },
    },
    ternary: {
      bgcolor: "#E5ECF6",
      aaxis: {
        gridcolor: "white",
        linecolor: "white",
        ticks: "",
      },
      baxis: {
        gridcolor: "white",
        linecolor: "white",
        ticks: "",
      },
      caxis: {
        gridcolor: "white",
        linecolor: "white",
        ticks: "",
      },
    },
    coloraxis: { colorbar: { outlinewidth: 0, ticks: "" } },
    colorscale: {
      sequential: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      sequentialminus: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      diverging: [
        [0, "#8e0152"],
        [0.1, "#c51b7d"],
        [0.2, "#de77ae"],
        [0.3, "#f1b6da"],
        [0.4, "#fde0ef"],
        [0.5, "#f7f7f7"],
        [0.6, "#e6f5d0"],
        [0.7, "#b8e186"],
        [0.8, "#7fbc41"],
        [0.9, "#4d9221"],
        [1, "#276419"],
      ],
    },
    xaxis: {
      gridcolor: "white",
      linecolor: "white",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "white",
      automargin: true,
      zerolinewidth: 2,
    },
    yaxis: {
      gridcolor: "white",
      linecolor: "white",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "white",
      automargin: true,
      zerolinewidth: 2,
    },
    scene: {
      xaxis: {
        backgroundcolor: "#E5ECF6",
        gridcolor: "white",
        linecolor: "white",
        showbackground: true,
        ticks: "",
        zerolinecolor: "white",
        gridwidth: 2,
      },
      yaxis: {
        backgroundcolor: "#E5ECF6",
        gridcolor: "white",
        linecolor: "white",
        showbackground: true,
        ticks: "",
        zerolinecolor: "white",
        gridwidth: 2,
      },
      zaxis: {
        backgroundcolor: "#E5ECF6",
        gridcolor: "white",
        linecolor: "white",
        showbackground: true,
        ticks: "",
        zerolinecolor: "white",
        gridwidth: 2,
      },
    },
    shapedefaults: { line: { color: "#2a3f5f" } },
    annotationdefaults: {
      arrowcolor: "#2a3f5f",
      arrowhead: 0,
      arrowwidth: 1,
    },
    geo: {
      bgcolor: "white",
      landcolor: "#E5ECF6",
      subunitcolor: "white",
      showland: true,
      showlakes: true,
      lakecolor: "white",
    },
    title: { x: 0.05 },
    mapbox: { style: "light" },
  },
} as any as Template;

export function BoxPlots({ scores }: { scores: Scores }) {
  const [enlarged, setEnlarged] = useState("");
  const data = useMemo(() => {
    if (enlarged === "") {
      return generateSubPlots(scores);
    }
    const data: BoxData[] = [];
    generateSubPlot(1, scores, data, enlarged);
    return data;
  }, [scores, enlarged]);
  const axes = useMemo(() => {
    if (enlarged === "") {
      return generateAxes();
    }
    const domains = {
      columns: [[0.0, 1.0]],
      rows: [[0, 1.0]],
    };
    const axes: Record<string, Partial<LayoutAxis & { matches: string }>> = {};
    generateAxesPair(
      1,
      axes,
      AXIS_NAMES[enlarged as keyof typeof AXIS_NAMES],
      domains,
      1
    );
    return axes;
  }, [enlarged]);
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
    template,
  };
  return (
    <>
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
        }}
      />
      <label>
        Enlarge a subplot{" "}
        <select value={enlarged} onChange={(e) => setEnlarged(e.target.value)}>
          <option value="">All vs Cluster Rank</option>
          {Object.entries(AXIS_NAMES).map(([key, value]) => (
            <option key={key} value={key}>
              {value} vs Cluster Rank
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
