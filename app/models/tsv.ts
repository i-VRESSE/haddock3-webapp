import { autoType, tsvParse } from "d3-dsv";

export function parseTsv<TRow>(
  body: string,
  dropComments = false,
  dropEmptyLines = false,
) {
  let lines = body;
  if (dropEmptyLines) {
    lines = removeEmptyLines(body);
  }
  if (dropComments) {
    lines = removeComments(lines);
  }
  // have to use dynamic import because
  // thats what makes it available in commonjs modules
  // according to remix dev error
  const rows = tsvParse(lines, autoType);
  return rows as unknown as TRow[];
}

export function removeEmptyLines(body: string) {
  return body
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

export function removeComments(body: string): string {
  return body.replace(/^#.*\n/gm, "");
}
