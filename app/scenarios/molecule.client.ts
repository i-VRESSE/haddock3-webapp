import { Structure, autoLoad } from "ngl";
import ResidueProxy from "ngl/dist/declarations/proxy/residue-proxy";

export interface Residue {
  resno: number;
  seq: string;
  sec: SecondaryStructure;
  surface?: boolean;
}
export type Chains = Record<string, Residue[]>;
export interface Molecule {
  structure: Structure;
  chains: Chains;
  file: File;
  originalFile: File; // File not passed through the pdbtools preprocess pipeline
}

export type SecondaryStructure = "sheet" | "helix" | "turn" | "";

function secondaryStructureOfResidue(
  residue: ResidueProxy
): SecondaryStructure {
  if (residue.isSheet()) {
    return "sheet";
  }
  if (residue.isHelix()) {
    return "helix";
  }
  if (residue.isTurn()) {
    return "turn";
  }
  return "";
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
        sec: secondaryStructureOfResidue(r),
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
