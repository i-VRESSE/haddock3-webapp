import { Structure, autoLoad } from "ngl";

export interface Residue {
  resno: number;
  seq: string;
  // residues which are not a amino acids, rna or dna do not have a single letter code representation
  // TODO handle non amino acids mrna or dna
  surface?: boolean;
}
export type Chains = Record<string, Residue[]>;
export interface Molecule {
  structure: Structure;
  chains: Chains;
  file: File;
  originalFile: File; // File not passed through the pdbtools preprocess pipeline
}

export function chainsFromStructure(structure: Structure) {
  const chains: Chains = {};
  structure.eachChain((c) => {
    const chainName = c.chainname;
    let residues: Residue[] = [];
    c.eachResidue((r) => {
      residues.push({
        resno: r.resno,
        seq: r.getResname1(),
      });
    });
    // Same chain can be before+after TER line
    // See https://github.com/haddocking/haddock3/blob/main/examples/data/1a2k_r_u.pdb
    // to prevent 2 chains called A,A merge their residues
    if (chains[chainName]) {
      residues = chains[chainName].concat(residues);
    }
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
