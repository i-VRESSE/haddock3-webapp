import { describe, test, expect } from "vitest";
import type { DirectoryItem } from "~/bartender-client";
import {
  getWeightsFromConfig,
  getLastCaprievalModule,
  interactivenessOfModule,
} from "./rescore.server";
import { buildPath } from "~/models/job.server";

describe("getWeightsFromConfig", () => {
  test("should return the correct weights", () => {
    // Pruned config of
    // output/data/configurations/enhanced_haddock_params.json
    // from run of docking-antibody-antigen-ranairCDR-clt-test.cfg example
    const config = {
      cns_exec: "",
      ncores: 8,
      max_cpus: true,
      mode: "local",
      batch_type: "slurm",
      queue: "",
      queue_limit: 100,
      concat: 1,
      self_contained: false,
      clean: false,
      preprocess: false,
      postprocess: true,
      run_dir: "output",
      molecules: ["data/4G6K_fv.pdb", "data/4I1B-matched.pdb"],
      "topoaa.1": {},
      "rigidbody.1": {},
      "caprieval.1": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
      "clustfcc.1": {
        threshold: 4,
        executable: "src/contact_fcc",
        contact_distance_cutoff: 5.0,
        fraction_cutoff: 0.6,
        strictness: 0.75,
      },
      "seletopclusts.1": {
        top_models: 10,
        top_cluster: 1000,
      },
      "caprieval.2": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
      "flexref.1": {},
      "caprieval.3": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
      "emref.1": {},
      "caprieval.4": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
      "emscoring.1": {},
      "clustfcc.2": {
        executable: "src/contact_fcc",
        contact_distance_cutoff: 5.0,
        fraction_cutoff: 0.6,
        threshold: 4,
        strictness: 0.75,
      },
      "seletopclusts.2": {
        top_cluster: 1000,
        top_models: NaN,
      },
      "caprieval.5": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
      "mdscoring.1": {
        w_air: 0.0,
        w_bsa: 0.0,
        w_cdih: 0.0,
        w_dani: 0.0,
        w_deint: 0.0,
        w_desolv: 1.0,
        w_elec: 0.2,
        w_lcc: -10000.0,
        w_rg: 0.0,
        w_sani: 0.0,
        w_sym: 0.0,
        w_vdw: 1.0,
        w_vean: 0.0,
        w_xpcs: 0.0,
        w_xrdc: 0.0,
        w_zres: 0.0,
        contactairs: false,
        kcont: 1.0,
        ssdihed: "",
        error_dih: 10,
        dnarest_on: false,
        ligand_param_fname: "",
        ligand_top_fname: "",
        elecflag: true,
        dielec: "cdie",
        epsilon: 1.0,
        dihedflag: true,
        individualize: true,
        solvent: "water",
        nemsteps: 200,
        timestep: 0.002,
        waterheatsteps: 100,
        watersteps: 1250,
        watercoolsteps: 500,
        iniseed: 917,
        keepwater: false,
        tolerance: 5,
        log_level: "quiet",
      },
      "caprieval.6": {
        reference_fname: "data/4G6M-matched.pdb",
        irmsd: true,
        fnat: true,
        lrmsd: true,
        ilrmsd: true,
        dockq: true,
        irmsd_cutoff: 10.0,
        fnat_cutoff: 5.0,
        receptor_chain: "A",
        ligand_chains: ["B"],
        sortby: "score",
        sort_ascending: true,
        alignment_method: "sequence",
        lovoalign_exec: "",
        clt_threshold: 4,
      },
    };
    const result = getWeightsFromConfig(config);
    const expected = {
      w_elec: 0.2,
      w_vdw: 1,
      w_desolv: 1,
      w_bsa: 0,
      w_air: 0,
    };

    expect(result).toEqual(expected);
  });
});

function outputFileWithoutInteractivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    isDir: true,
    isFile: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        isDir: true,
        isFile: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        isDir: true,
        isFile: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        isDir: true,
        isFile: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        isDir: true,
        isFile: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        isDir: true,
        isFile: false,
      },
      {
        name: "data",
        path: "output/data",
        isDir: true,
        isFile: false,
      },
      {
        name: "log",
        path: "output/log",
        isDir: false,
        isFile: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        isDir: true,
        isFile: false,
      },
    ],
  };
}

function outputFileWtih3Interactivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    isDir: true,
    isFile: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        isDir: true,
        isFile: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        isDir: true,
        isFile: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        isDir: true,
        isFile: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        isDir: true,
        isFile: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive",
        path: "output/15_caprieval_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        isDir: true,
        isFile: false,
      },
      {
        name: "data",
        path: "output/data",
        isDir: true,
        isFile: false,
      },
      {
        name: "log",
        path: "output/log",
        isDir: false,
        isFile: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        isDir: true,
        isFile: false,
      },
    ],
  };
}

describe("getLastCaprievalModule", () => {
  test("should return the last caprieval module", () => {
    const files = outputFileWithoutInteractivness();
    const result = getLastCaprievalModule(files);
    const expected = 15;
    expect(result).toEqual(expected);
  });
});

describe("interactivenessOfModule", () => {
  test.each([
    [outputFileWithoutInteractivness(), 0],
    [outputFileWtih3Interactivness(), 3],
  ])("should return the number of interactive modules", (files, expected) => {
    const result = interactivenessOfModule(15, files);
    expect(result).toEqual(expected);
  });
});

describe('buildPath()', () => {
  test.each([
    [{ moduleIndex: 1, moduleName: 'caprieval' }, 'output/01_caprieval/'],
    [{ moduleIndex: 15, moduleName: 'caprieval' }, 'output/15_caprieval/'],
    [{ moduleIndex: 1, moduleName: 'caprieval', interactivness: 1 }, 'output/01_caprieval_interactive/'],
    [{ moduleIndex: 1, moduleName: 'caprieval', interactivness: 2 }, 'output/01_caprieval_interactive_interactive/'],
    [{ moduleIndex: 1, moduleName: 'caprieval', interactivness: 3 }, 'output/01_caprieval_interactive_interactive_interactive/'],
  ])('should return the correct path', (input, expected) => {
    const result = buildPath(input);
    expect(result).toEqual(expected);
  })
})