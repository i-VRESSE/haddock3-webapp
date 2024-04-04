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
    const residues: Residue[] = [];
    c.eachResidue((r) => {
      residues.push({
        resno: r.resno,
        seq: r.getResname1(),
        sec: secondaryStructureOfResidue(r),
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
