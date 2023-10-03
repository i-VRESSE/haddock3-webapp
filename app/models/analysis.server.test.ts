import { expect, describe, test } from "vitest";
import { parsePlotlySpecs } from "./analysis.server";

describe("parsePlotlySpecs()", () => {
  test("should return plotly specs", () => {
    const reportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <script type="text/javascript">
            window.PLOTLYENV = window.PLOTLYENV || {};
            if (document.getElementById("b884c68e-c17b-4e78-afd4-dcfb40d8a5da")) {
                Plotly.newPlot(
                "b884c68e-c17b-4e78-afd4-dcfb40d8a5da",
                [
                    {
                    x: [1999, 2000, 2001, 2002],
                    y: [10, 15, 13, 17],
                    type: "scatter",
                    },
                ],
                {
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
                { responsive: true }
                );
            }
            </script>
        </body>
        </html>
        `;

    const specs = parsePlotlySpecs(reportHtml);
    const expected = {
        'b884c68e-c17b-4e78-afd4-dcfb40d8a5da': {
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
            config: { responsive: true }
        }
    }
    expect(specs).toEqual(expected);    
  });
});
