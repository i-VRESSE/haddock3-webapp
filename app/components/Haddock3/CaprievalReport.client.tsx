import { ClusterTable } from "@i-vresse/haddock3-analysis-components";
import "@i-vresse/haddock3-analysis-components/dist/style.css";
import type {
  Cluster,
  ClusterID,
} from "@i-vresse/haddock3-analysis-components/dist/components/ClusterTable";
import { useMemo } from "react";
import type {
  CaprievalClusterRow,
  CaprievalPlotlyProps,
  CaprievalStructureRow,
} from "~/tools/rescore.server";

import { ScatterPlots } from "./ScatterPlots";
import { useSearchParams } from "@remix-run/react";
import { BoxPlots } from "./BoxPlots";

/*
  Component has to be client only due 
  to sorting and ngl structure viewer needing browser.
  */

export interface Scores {
  structures: CaprievalStructureRow[];
  clusters: CaprievalClusterRow[];
}

interface CaprievalReportProps {
  scores: Scores;
  prefix: string;
  plotlyPlots: CaprievalPlotlyProps;
}

const MAX_BEST = 3;
const NR_STRUCTURE_LENGTH = Math.ceil(Math.log10(MAX_BEST));
const headers = {
  rank: "Cluster Rank",
  id: "Cluster ID",
  size: "Cluster size",
  "HADDOCK score [a.u.]": "HADDOCK score [a.u.]",
  "interface RMSD [A]": "interface RMSD [A]",
  "Fraction of Common Contacts": "Fraction of Common Contacts",
  "ligand RMSD [A]": "ligand RMSD [A]",
  DOCKQ: "DOCKQ",
  "Restraints Energy": "Restraints Energy",
  "Desolvation Energy": "Desolvation Energy",
  "Electrostatic Energy": "Electrostatic Energy",
  "Van der Waals Energy": "Van der Waals Energy",
  ...Object.fromEntries(
    Array.from({ length: MAX_BEST }, (_, i) => {
      const index = i + 1;
      return [
        `Nr ${index
          .toString()
          .padStart(NR_STRUCTURE_LENGTH, "0")} best structure`,
        `Nr ${index
          .toString()
          .padStart(NR_STRUCTURE_LENGTH, "0")} best structure`,
      ];
    })
  ),
} as const;

export function scores2clusters(
  scores: Scores,
  prefix: string
): Record<ClusterID, Cluster> {
  const result = scores.clusters.map((cluster, index) => {
    // cluster has .total and .total_std fields
    // but it is not clear what they are
    // they are not used in the analysis
    // TODO add Total Energy aka total row to stats???
    const stats = {
      "HADDOCK score [a.u.]": {
        mean: cluster.score,
        std: cluster.score_std,
      },
      "interface RMSD [A]": {
        mean: cluster.irmsd,
        std: cluster.irmsd_std,
      },
      "Fraction of Common Contacts": {
        mean: cluster.fnat,
        std: cluster.fnat_std,
      },
      "ligand RMSD [A]": {
        mean: cluster.lrmsd,
        std: cluster.lrmsd_std,
      },
      DOCKQ: {
        mean: cluster.dockq,
        std: cluster.dockq_std,
      },
      "Restraints Energy": {
        mean: cluster.air,
        std: cluster.air_std,
      },
      "Desolvation Energy": {
        mean: cluster.desolv,
        std: cluster.desolv_std,
      },
      "Electrostatic Energy": {
        mean: cluster.elec,
        std: cluster.elec_std,
      },
      "Van der Waals Energy": {
        mean: cluster.vdw,
        std: cluster.vdw_std,
      },
    };
    const best = Object.fromEntries(
      scores.structures
        .filter((s) => s["cluster-id"] === cluster.cluster_id)
        .slice(0, MAX_BEST)
        .map((s, i) => {
          const index = i + 1;
          // webapp always performs clean which packs the models with gzip
          // but capri_ss.tsv is written before clean
          // so we need to correct the path as it is after clean
          const path = s.model!.toString().replace("../", prefix) + ".gz";
          return [
            `Nr ${index
              .toString()
              .padStart(NR_STRUCTURE_LENGTH, "0")} best structure`,
            path,
          ];
        })
    );
    return [
      index,
      {
        rank:
          cluster.cluster_rank === "-" ? "Unclustered" : cluster.cluster_rank,
        id: cluster.cluster_id,
        size: cluster.n,
        stats,
        best,
      },
    ];
  });
  return Object.fromEntries(result);
}

export const CaprievalReport = ({
  scores,
  prefix,
  plotlyPlots,
}: CaprievalReportProps) => {
  const { scatters, boxes } = plotlyPlots;
  const clusters = useMemo(
    () => scores2clusters(scores, prefix),
    [scores, prefix]
  );
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="flex flex-col gap-4">
      <ClusterTable headers={headers} clusters={clusters} maxbest={MAX_BEST} />
      <ScatterPlots
        data={scatters.data}
        layout={scatters.layout}
        selected={searchParams.get("ss") ?? "report"}
        onChange={(s) =>
          setSearchParams(
            (prev) => {
              prev.set("ss", s);
              return prev;
            },
            { preventScrollReset: true }
          )
        }
      />
      <BoxPlots
        data={boxes.data}
        layout={boxes.layout}
        selected={searchParams.get("bs") ?? "report"}
        onChange={(s) =>
          setSearchParams(
            (prev) => {
              prev.set("bs", s);
              return prev;
            },
            { preventScrollReset: true }
          )
        }
      />
    </div>
  );
};
