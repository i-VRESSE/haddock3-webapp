import type { Layout, Data, LayoutAxis, AxisName, Template } from "plotly.js";
import { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import type { Scores } from "./CaprievalReport.client";

// TODO move component to https://github.com/i-VRESSE/haddock3-analysis-components

const SUBPLOTS = {
  columns: ["score", "desolv", "vdw", "elec", "air"],
  rows: ["fnat", "ilrmsd", "lrmsd", "dockq", "irmsd"],
} as const;

const DOMAINS = {
  columns: [
    [0.0, 0.152],
    [0.212, 0.364],
    [0.424, 0.576],
    [0.636, 0.788],
    [0.848, 1.0],
  ],
  rows: [
    [0.0, 0.152],
    [0.212, 0.364],
    [0.424, 0.576],
    [0.636, 0.788],
    [0.848, 1.0],
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
} as const;

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
        x: structures4cluster.map((s) => s[row as keyof typeof s]),
        y: structures4cluster.map((s) => s[column as keyof typeof s]),
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
      const x = cluster[row as keyof typeof cluster];
      const y = cluster[column as keyof typeof cluster];
      data.push({
        error_x: {
          array: [cluster[(row + "_std") as keyof typeof cluster]],
          type: "data",
          visible: true,
        },
        error_y: {
          array: [cluster[(column + "_std") as keyof typeof cluster]],
          type: "data",
          visible: true,
        },
        x: [x],
        y: [y],
        marker: { color, size: 10, symbol: "square-dot" },
        text: [
          `Cluster ${cluster.cluster_id}<br>${column}: ${y}<br>${row}: ${x}`,
        ],
        hoverlabel: {
          bgcolor: color,
          font: { family: "Helvetica", size: 16 },
        },
        hovertemplate: `<b>Cluster ${cluster.cluster_id}<br>${column}: ${y}<br>${row}: ${x}</b><extra></extra>`,
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
        structures4cluster.map((s) => s[row as keyof typeof s])
      );
      other.y = (other.y as Array<string | number>).concat(
        structures4cluster.map((s) => s[column as keyof typeof s])
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
  axes: Record<string, Partial<LayoutAxis & { matches: string }>>,
  domains = DOMAINS
) {
  const xaxisKey = "xaxis" + (aIndex === 1 ? "" : aIndex);
  const yaxisKey = "yaxis" + (aIndex === 1 ? "" : aIndex);
  const ax = ("x" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const ay = ("y" + (aIndex === 1 ? "" : aIndex)) as AxisName;
  const colindex = SUBPLOTS.columns.indexOf(column as any);
  const rowindex = SUBPLOTS.rows.indexOf(row as any);
  const mx =
    rowindex === 0 ? "x" : "x" + (rowindex + 1) * SUBPLOTS.columns.length;
  const my = colindex === 0 ? "y" : "y" + (colindex + 1);
  axes[xaxisKey] = {
    anchor: ay,
    domain: domains.columns[colindex],
    title: {
      text: TITLE_NAMES[row as keyof typeof TITLE_NAMES],
      standoff: 5,
    },
    automargin: true,
  };
  axes[yaxisKey] = {
    anchor: ax,
    domain: domains.rows[rowindex],
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

export function ScatterPlots({ scores }: { scores: Scores }) {
  const [enlarged, setEnlarged] = useState("");

  const data = useMemo(() => {
    if (enlarged === "") {
      return generateSubPlots(scores);
    }
    const [row, column] = enlarged.split(",");
    const data: Data[] = [];
    generateSubPlot(1, scores, row, column, data);
    return data;
  }, [scores, enlarged]);
  const axes = useMemo(() => {
    if (enlarged === "") {
      return generateAxes();
    }
    const [row, column] = enlarged.split(",");
    const axes: Record<string, Partial<LayoutAxis & { matches: string }>> = {};
    const domains = {
      columns: [[0.0, 1.0]],
      rows: [[0.0, 1.0]],
    };
    generatePlotAxes(1, column, row, axes, domains);
    return axes;
  }, [enlarged]);
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
          <option value="">All vs All</option>
          {SUBPLOTS.rows.map((row) =>
            SUBPLOTS.columns.map((column) => (
              <option key={`${row},${column}`} value={`${row},${column}`}>
                {TITLE_NAMES[row]} vs {TITLE_NAMES[column]}
              </option>
            ))
          )}
        </select>
      </label>
    </>
  );
}
