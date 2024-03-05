import { describe, test, expect } from "vitest";
import { getPlotFromHtml } from "~/lib/html";

describe("getPlotFromHtml", () => {
  test("should return the plotly data and layout", () => {
    const expected = {
      data: [
        {
          x: [1999, 2000, 2001, 2002],
          y: [10, 15, 13, 17],
          type: "scatter",
        },
      ],
      layout: {
        title: "Sales Growth",
        xaxis: {
          title: "Year",
          showgrid: false,
          zeroline: false,
        },
        yaxis: {
          title: "Percent",
          showline: false,
        },
      },
    };
    const input = `
    <div>
    <script type="text/javascript">window.PlotlyConfig = { MathJaxConfig: 'local' };</script>
    <script src="https://cdn.plot.ly/plotly-2.16.1.min.js"></script>
    <div id="6ce37419-297c-401e-860d-61704c0795b8" class="plotly-graph-div" style="height:800px; width:1000px;">
    </div>
    <script id="data1" type="application/json">
        ${JSON.stringify(expected)}
    </script>
    <script type="text/javascript">
        const { data, layout } = JSON.parse(document.getElementById("data1").text)
        window.PLOTLYENV = window.PLOTLYENV || {};
        if (document.getElementById("6ce37419-297c-401e-860d-61704c0795b8")) {
            Plotly.newPlot(
                "6ce37419-297c-401e-860d-61704c0795b8",
                data,
                layout,
                { responsive: true },
            );
        }
    </script>
</div>
    `;

    const p = getPlotFromHtml(input);
    expect(p).toEqual(expected);
  });
});
