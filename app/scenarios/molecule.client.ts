import { Structure, autoLoad } from "ngl";

export type Residue = { resno: number; seq: string };
export type Chains = Record<string, Residue[]>;
export type Molecule = { structure: Structure; chains: Chains; file: File };

export function chainsFromStructure(structure: Structure) {
  const chains: Chains = {};
  structure.eachChain((c) => {
    const chainName = c.chainname;
    const residues: Residue[] = [];
    c.eachResidue((r) => {
      residues.push({
        resno: r.resno,
        seq: r.getResname1(),
      });
    });
    chains[chainName] = residues;
  });
  return chains;
}

export async function loadStructure(blob: Blob) {
  const structure: Structure = await autoLoad(blob);
  if (!structure) {
    throw new Error("Could not load structure");
  }
  return structure;
}
