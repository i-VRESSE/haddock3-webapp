export function hetGrep(
  pdb: string,
  hetUnpadded: string,
  chain: string,
  sequenceNr: number,
): string {
  const het = hetUnpadded.padEnd(3, " ");
  const sequence = sequenceNr.toString().padStart(4, " ");
  const lines = pdb.split("\n");
  // Possible improvements:
  // - match het in slice
  // - include ANISOU lines
  // - filter out conect lines that are from selected het to other

  const filters = {
    het: (line: string) =>
      line.startsWith("HET   ") &&
      line.includes(het) &&
      line[12] === chain &&
      line.slice(13, 17) === sequence,
    hetnam: (line: string) => line.startsWith("HETNAM") && line.includes(het),
    hetatm: (line: string) =>
      line.startsWith("HETATM") &&
      line.includes(het) &&
      line[21] === chain &&
      line.slice(22, 26) === sequence,
  };
  const result = [
    "REMARK 200 Generated with haddock3-webapp hetGrep method                        ",
    ...lines.filter(filters.het),
    ...lines.filter(filters.hetnam),
  ];
  const hetatms = lines.filter(filters.hetatm);
  result.push(...hetatms);
  const serials = new Set(hetatms.map((line) => line.slice(6, 11)));
  const conects = lines.filter(
    (line) => line.startsWith("CONECT") && serials.has(line.slice(6, 11)),
  );
  result.push(...conects);
  result.push("END");
  return result.join("\n") + "\n";
}

export async function hetGrepFile(
  file: File,
  hetUnpadded: string,
  chain: string,
  sequenceNr: number,
): Promise<File> {
  const pdb = await file.text();
  const result = hetGrep(pdb, hetUnpadded, chain, sequenceNr);
  return new File([result], file.name, { type: file.type });
}
