import type { Cluster } from "node_modules/@i-vresse/haddock3-analysis-components/dist/components/ClusterTable";
import { Header } from "node_modules/@i-vresse/haddock3-analysis-components/dist/components/SortableTable";
import { Structure } from "node_modules/@i-vresse/haddock3-analysis-components/dist/components/StructureTable";
import { Scores } from "./CaprievalReport.client";
import { CaprievalClusterRow, CaprievalStructureRow } from "./caprieval.server";

const MAX_NR_CLUSTERS = 10;
const MAX_BEST_CLUSTERED_STRUCTURES = 4;
const MAX_BEST_UNCLUSTERED_STRUCTURES = 10;

const AXIS_NAMES = {
  score: "HADDOCK score [a.u.]",
  vdw: "Van der Waals Energy",
  elec: "Electrostatic Energy",
  air: "Restraints Energy",
  desolv: "Desolvation Energy",
  irmsd: "interface RMSD [A]",
  lrmsd: "ligand RMSD [A]",
  ilrmsd: "interface-ligand RMSD [A]",
  fnat: "Fraction of Common Contacts",
  dockq: "DOCKQ",
  bsa: "Buried Surface Area [A^2]",
} as const;

function isUnclustered(clusters: CaprievalClusterRow[]): boolean {
  return clusters.every((c) => c.cluster_id === "-");
}

export function scores2table(
  scores: Scores,
  prefix: string
):
  | { clusters: Cluster[]; headers: Header[] }
  | { structures: Structure[]; headers: Header[] } {
  if (isUnclustered(scores.clusters)) {
    return scores2structuretable(scores.structures, prefix);
  }
  return {
    clusters: [],
    headers: [],
  };
}
function scores2structuretable(
  structures: CaprievalStructureRow[],
  prefix: string
): { structures: Structure[]; headers: Header[] } {
  const cols2keep = ["caprieval_rank", "model", ...Object.keys(AXIS_NAMES)];
  const table = structures.slice(MAX_BEST_UNCLUSTERED_STRUCTURES).map((s) => {
    return Object.fromEntries(
      Object.entries(s).filter(([key, _value]) => key in cols2keep)
    ) as Structure;
  });

  return {
    structures: table,
    headers: [],
  };
}
