import { parse } from "acorn";
import { simple } from "acorn-walk";
import { load } from "cheerio";
import type { Config, Data, Layout } from "plotly.js";
import { buildPath, getJobfile } from "./job.server";

interface PlotlySpec {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
}

async function fetchReportHtml(jobid: number, moduleIndex: number, bartenderToken:string): Promise<string> {
    const path = buildPath({
        prefix: 'output/analyis',
        moduleIndex,
        moduleName: "caprieval",
        suffix: "report.html",
    });
    const response = await getJobfile(jobid, path, bartenderToken);
    return response.text();
}

export async function specsFromJob(jobid: number, moduleIndex: number, bartenderToken: string): Promise<
{scatter: PlotlySpec, box: PlotlySpec}> {
    const reportHtml = await fetchReportHtml(jobid, moduleIndex, bartenderToken);
    const specs = parsePlotlySpecs(reportHtml);
    const values = Object.values(specs);
    // The report has scatter plots first and box plots second
    return {
        scatter: values[0],
        box: values[1]
    };
}

// TODO make parsing easier by
// in haddock3 writing script tags for each plotly spec
// in haddock3-analysis-components using Plot from react-plotly.js to draw plots

export function parsePlotlySpecs(
  reportHtml: string
): Record<string, PlotlySpec> {
  const plotlyScriptTags = getPlotlyScriptTags(reportHtml);
  return Object.fromEntries(plotlyScriptTags.flatMap(getSpecFromScript));;
}

function getPlotlyScriptTags(reportHtml: string): string[] {
  const $ = load(reportHtml);
  const plotlyScriptTags: string[] = [];

  $("script").each((_, script) => {
    const scriptContent = $(script).html();
    if (scriptContent && scriptContent.includes("Plotly.newPlot")) {
      plotlyScriptTags.push(scriptContent);
    }
  });

  return plotlyScriptTags;
}

function getSpecFromScript(script: string): [string, PlotlySpec][] {
  const ast = parse(script, { ecmaVersion: 2020 });
  const specs: Record<string, PlotlySpec> = {};
  simple(ast, {
    CallExpression(node: any) {
      if (
        node.callee.object.name === "Plotly" &&
        node.callee.property.name === "newPlot"
      ) {
        const id = node.arguments[0].value;
        // eslint-disable-next-line no-eval
        const data = eval(
          script.substring(node.arguments[1].start, node.arguments[1].end)
        );
        const layout_string = script.substring(
          node.arguments[2].start,
          node.arguments[2].end
        );
        // eslint-disable-next-line no-eval
        const layout = eval(`(${layout_string})`);
        const config_string = script.substring(
            node.arguments[3].start,
            node.arguments[3].end
            );
        // eslint-disable-next-line no-eval
        const config = eval(`(${config_string})`);
        specs[id] = { data, layout, config };
      }
    },
  });
  return Object.entries(specs);
}
