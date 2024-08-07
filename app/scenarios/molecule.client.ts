import { Structure, autoLoad } from "ngl";
import { getResName1 } from "@i-vresse/haddock3-ui/getResName1";
import ResidueProxy from "ngl/dist/declarations/proxy/residue-proxy";

export interface Residue {
  resno: number;
  resname: string;
  seq: string;
  surface?: boolean;
}
export type Chains = Record<string, Residue[]>;

function residuesPerChain<T>(
  structure: Structure,
  accessor: (r: ResidueProxy) => T,
): Record<string, T[]> {
  const chains: Record<string, T[]> = {};
  structure.eachChain((c) => {
    const chainName = c.chainname;
    let residues: T[] = [];
    c.eachResidue((r) => {
      residues.push(accessor(r));
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

export function chainsFromStructure(structure: Structure): Chains {
  return residuesPerChain(structure, (r) => ({
    resno: r.resno,
    resname: r.resname,
    seq: getResName1(r.resname),
  }));
}

export function residueNumbers(structure: Structure) {
  return residuesPerChain(structure, (r) => r.resno);
}

export async function loadStructure(blob: Blob) {
  const structure: Structure = await autoLoad(blob);
  if (!structure) {
    throw new Error("Could not load structure");
  }
  return structure;
}
