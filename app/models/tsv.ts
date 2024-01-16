export async function parseTsv<TRow>(
  body: string,
  dropComments = false,
  dropEmptyLines = false
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
  const { tsvParse, autoType } = await import("d3-dsv");
  return tsvParse(lines, autoType) as any as Promise<TRow[]>;
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
