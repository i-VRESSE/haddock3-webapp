import { describe, it, expect } from "vitest";

import { type Scores } from "./CaprievalReport.client";
import { scores2table } from "./scores2table";

describe("scores2clusters", () => {
  it("unclustered", () => {
    const scores: Scores = {
      structures: [
        {
          model: "../../01_rigidbody/rigidbody_757.pdb",
          md5: "-",
          caprieval_rank: 1,
          score: -41.72,
          irmsd: 0.81,
          fnat: 0.842,
          lrmsd: 0.905,
          ilrmsd: 0.802,
          dockq: 0.868,
          "cluster-id": "-",
          "cluster-ranking": "-",
          "model-cluster-ranking": "-",
          air: 11.179,
          angles: 0.0,
          bonds: 0.0,
          bsa: 599.121,
          cdih: 0.0,
          coup: 0.0,
          dani: 0.0,
          desolv: 3.487,
          dihe: 0.0,
          elec: -12.237,
          improper: 0.0,
          rdcs: 0.0,
          rg: 0.0,
          sym: 0.0,
          total: -28.148,
          vdw: -27.09,
          vean: 0.0,
          xpcs: 0.0,
        },
      ],
      clusters: [
        {
          cluster_rank: "-",
          cluster_id: "-",
          n: 1000,
          under_eval: "-",
          score: -41.618,
          score_std: 0.095,
          irmsd: 0.806,
          irmsd_std: 0.002,
          fnat: 0.869,
          fnat_std: 0.027,
          lrmsd: 0.834,
          lrmsd_std: 0.045,
          dockq: 0.878,
          dockq_std: 0.009,
          air: 14.737,
          air_std: 15.682,
          bsa: 598.022,
          bsa_std: 6.71,
          desolv: 3.509,
          desolv_std: 0.052,
          elec: -12.297,
          elec_std: 0.345,
          total: -24.557,
          total_std: 15.466,
          vdw: -26.997,
          vdw_std: 0.356,
          caprieval_rank: 1,
        },
      ],
    };

    const expected = {
      structures: [
        {
          caprieval_rank: 1,
          model: "../../01_rigidbody/rigidbody_757.pdb.gz",
          score: -41.72,
          vdw: -27.09,
          elec: -12.24,
          air: 11.18,
          desolv: 3.49,
          irmsd: 0.81,
          lrmsd: 0.9,
          ilrmsd: 0.8,
          fnat: 0.84,
          dockq: 0.87,
          bsa: 599.12,
          id: "757",
        },
      ],
      headers: [
        { key: "caprieval_rank", label: "Structure Rank", sorted: "asc" },
        {
          key: "model",
          label: "Structure",
          sortable: false,
          type: "structure",
        },
        { key: "score", label: "HADDOCK score [a.u.]", type: "stats" },
        { key: "vdw", label: "Van der Waals Energy", type: "stats" },
        { key: "elec", label: "Electrostatic Energy", type: "stats" },
        { key: "air", label: "Restraints Energy", type: "stats" },
        { key: "desolv", label: "Desolvation Energy", type: "stats" },
        { key: "irmsd", label: "interface RMSD [A]", type: "stats" },
        { key: "lrmsd", label: "ligand RMSD [A]", type: "stats" },
        { key: "ilrmsd", label: "interface-ligand RMSD [A]", type: "stats" },
        { key: "fnat", label: "Fraction of Common Contacts", type: "stats" },
        { key: "dockq", label: "DOCKQ", type: "stats" },
        { key: "bsa", label: "Buried Surface Area [A^2]", type: "stats" },
        { key: "id", label: "Structure ID" },
      ],
    };

    const actual = scores2table(scores, "prefix");

    expect(actual).toEqual(expected);
  });
});
