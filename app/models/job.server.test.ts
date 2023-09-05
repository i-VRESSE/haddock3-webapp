import { describe, test, expect } from "vitest";
import { getWeightsFromConfig } from "./job.server";

describe('getWeightsFromConfig', () => {
    test('should return the correct weights', () => {
        // Pruned config of
        // output/data/configurations/enhanced_haddock_params.json
        // from run of docking-antibody-antigen-ranairCDR-clt-test.cfg example
        const config = {
            "cns_exec": "",
            "ncores": 8,
            "max_cpus": true,
            "mode": "local",
            "batch_type": "slurm",
            "queue": "",
            "queue_limit": 100,
            "concat": 1,
            "self_contained": false,
            "clean": false,
            "preprocess": false,
            "postprocess": true,
            "run_dir": "output",
            "molecules": [
                "data/4G6K_fv.pdb",
                "data/4I1B-matched.pdb"
            ],
            "topoaa.1": {
            },
            "rigidbody.1": {
            },
            "caprieval.1": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            },
            "clustfcc.1": {
                "threshold": 4,
                "executable": "src/contact_fcc",
                "contact_distance_cutoff": 5.0,
                "fraction_cutoff": 0.6,
                "strictness": 0.75
            },
            "seletopclusts.1": {
                "top_models": 10,
                "top_cluster": 1000
            },
            "caprieval.2": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            },
            "flexref.1": {
            },
            "caprieval.3": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            },
            "emref.1": {
            },
            "caprieval.4": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            },
            "emscoring.1": {
            },
            "clustfcc.2": {
                "executable": "src/contact_fcc",
                "contact_distance_cutoff": 5.0,
                "fraction_cutoff": 0.6,
                "threshold": 4,
                "strictness": 0.75
            },
            "seletopclusts.2": {
                "top_cluster": 1000,
                "top_models": NaN
            },
            "caprieval.5": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            },
            "mdscoring.1": {
                "w_air": 0.0,
                "w_bsa": 0.0,
                "w_cdih": 0.0,
                "w_dani": 0.0,
                "w_deint": 0.0,
                "w_desolv": 1.0,
                "w_elec": 0.2,
                "w_lcc": -10000.0,
                "w_rg": 0.0,
                "w_sani": 0.0,
                "w_sym": 0.0,
                "w_vdw": 1.0,
                "w_vean": 0.0,
                "w_xpcs": 0.0,
                "w_xrdc": 0.0,
                "w_zres": 0.0,
                "contactairs": false,
                "kcont": 1.0,
                "ssdihed": "",
                "error_dih": 10,
                "dnarest_on": false,
                "ligand_param_fname": "",
                "ligand_top_fname": "",
                "elecflag": true,
                "dielec": "cdie",
                "epsilon": 1.0,
                "dihedflag": true,
                "individualize": true,
                "solvent": "water",
                "nemsteps": 200,
                "timestep": 0.002,
                "waterheatsteps": 100,
                "watersteps": 1250,
                "watercoolsteps": 500,
                "iniseed": 917,
                "keepwater": false,
                "tolerance": 5,
                "log_level": "quiet"
            },
            "caprieval.6": {
                "reference_fname": "data/4G6M-matched.pdb",
                "irmsd": true,
                "fnat": true,
                "lrmsd": true,
                "ilrmsd": true,
                "dockq": true,
                "irmsd_cutoff": 10.0,
                "fnat_cutoff": 5.0,
                "receptor_chain": "A",
                "ligand_chains": [
                    "B"
                ],
                "sortby": "score",
                "sort_ascending": true,
                "alignment_method": "sequence",
                "lovoalign_exec": "",
                "clt_threshold": 4
            }
        }
        const result = getWeightsFromConfig(config)
        const expected = {
            w_elec: 0.2,
            w_vdw: 1,
            w_desolv: 1,
            w_bsa: 0,
            w_air: 0,
        }
        expect(result).toEqual(expected)
    })
})