export const BARTENDER_APPLICATION_NAME = "haddock3";
export const WORKFLOW_CONFIG_FILENAME = "workflow.cfg";
export const JOB_OUTPUT_DIR = "output";

export const CAPRIEVAL_SCATTERPLOT_CHOICES = {
  report: "All vs All",
  fnat_score: "FCC vs HADDOCK score",
  fnat_desolv: "FCC vs Edesolv",
  fnat_vdw: "FCC vs Evdw",
  fnat_elec: "FCC vs Eelec",
  fnat_air: "FCC vs Eair",
  ilrmsd_score: "il-RMSD vs HADDOCK score",
  ilrmsd_desolv: "il-RMSD vs Edesolv",
  ilrmsd_vdw: "il-RMSD vs Evdw",
  ilrmsd_elec: "il-RMSD vs Eelec",
  ilrmsd_air: "il-RMSD vs Eair",
  lrmsd_score: "l-RMSD vs HADDOCK score",
  lrmsd_desolv: "l-RMSD vs Edesolv",
  lrmsd_vdw: "l-RMSD vs Evdw",
  lrmsd_elec: "l-RMSD vs Eelec",
  lrmsd_air: "l-RMSD vs Eair",
  dockq_score: "DOCKQ vs HADDOCK score",
  dockq_desolv: "DOCKQ vs Edesolv",
  dockq_vdw: "DOCKQ vs Evdw",
  dockq_elec: "DOCKQ vs Eelec",
  dockq_air: "DOCKQ vs Eair",
  irmsd_score: "i-RMSD vs HADDOCK score",
  irmsd_desolv: "i-RMSD vs Edesolv",
  irmsd_vdw: "i-RMSD vs Evdw",
  irmsd_elec: "i-RMSD vs Eelec",
  irmsd_air: "i-RMSD vs Eair",
} as const;

export const CAPRIEVAL_BOXPLOT_CHOICES = {
  report: "All",
  score_clt: "HADDOCK score [a.u.]",
  vdw_clt: "Van der Waals Energy",
  elec_clt: "Electrostatic Energy",
  air_clt: "Restraints Energy",
  desolv_clt: "Desolvation Energy",
  irmsd_clt: "interface RMSD [A]",
  lrmsd_clt: "ligand RMSD [A]",
  ilrmsd_clt: "interface-ligand RMSD [A]",
  fnat_clt: "Fraction of Common Contacts",
  dockq_clt: "DOCKQ",
  bsa_clt: "Buried Surface Area [A^2]",
} as const;
