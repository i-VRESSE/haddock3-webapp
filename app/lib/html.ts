import { PlotlyProps } from "~/components/PlotlyPlot";

export function getPlotFromHtml(html: string, plotId = 1) {
  return getDataFromHtml<PlotlyProps>(html, `data${plotId}`);
}

export function getDataFromHtml<T>(html: string, id: string) {
  // this is very fragile, but much faster then using a HTML parser
  // as order of attributes is not guaranteed
  // see commit meessage of this line for benchmark
  const re = new RegExp(
    `<script id="${id}" type="application\\/json">([\\s\\S]*?)<\\/script>`
  );
  const a = html.match(re);
  if (!a) {
    throw new Error(`could not find script with id ${id}`);
  }
  const dataAsString = a[1].trim();
  return JSON.parse(dataAsString) as T;
}
