# Demonstration

This a demonstration of the [Antibody-antigen modelling tutorial](https://www.bonvinlab.org/education/HADDOCK3/HADDOCK3-antibody-antigen/), but instead of using the Haddock3 command line interface, we will use the webapp.

This demo can be prepared using the [preparations](PREPARATIONS.md) guide.

From the original tutorial we use scenario 2b: Docking using the paratope and the NMR-identified epitope as active

1. Goto start page at http://localhost:8000
2. Goto scenarios page
3. Goto Antibody-antigen scenario page
4. For antibody
5. Upload `./input/4G6K.pdb` file
6. Select chain H
7. Import active residues: `31,32,33,34,35,52,54,55,56,100,101,102,103,104,105,106,1031,1032,1049,1050,1053,1091,1092,1093,1094,1096`
8. For antigen
   1. Upload `./input/4I1B.pdb`
   2. Import active residues: `72,73,74,75,81,83,84,89,90,92,94,96,97,98,115,116,117`
9. For reference structure upload `./input/4G6M.pdb` file.
10. Refine in builder

Do not submit as this will render laptop unusable for a while.

1. Goto http://localhost:8000/jobs
2. Open job named `antibody-antigen-completed`
3. Goto report page,
4. Goto browse page

TODO add conclusion adapted from original tutorial here

## Features

Features of the web application that are nice to show off.

### Scenario page

[![Screenshot of filled antibody antigen scenario page](./screenshots/scenario_antibody-antigen.png)](./screenshots/scenario_antibody-antigen.png)

### Workflow builder

[![Screenshot of builder page filled with antibody antigen scenario](./screenshots/builder.png)](./screenshots/builder.png)

#### Form and text synchronization

1. Select rigibody module
2. Expand sampling
3. Change to text tab
4. Change number of models to generate to 2000

See how form and text visualization are synchronized.

### Report page

### Browse page

#### Edit

If you found looking at the results that you want use a slightly different workflow, you can edit the job and resubmit it.

An uploadied completed job can not be edited. So use an actual locally run job if you want to show that off.

## Talking points

### What is HADDOCK?

Is software that tries to figure out how 2 or more molecules can fit together using information to tell which parts are important.

HADDOCK (High Ambiguity Driven protein-protein DOCKing) is an information-driven flexible docking approach for the modeling of biomolecular complexes.

HADDOCK distinguishes itself from ab-initio docking methods in the fact that it encodes information from identified or predicted protein interfaces in ambiguous interaction restraints (AIRs) to drive the docking process. It also allows to define specific unambiguous distance restraints (e.g. from MS cross-links) and supports a variety of other experimental data including NMR residual dipolar couplings, pseudo contact shifts and cryo-EM maps.
HADDOCK can deal with a large class of modeling problems including protein-protein, protein-nucleic acids and protein-ligand complexes, including multi-bodies (N>2) assemblies.

### Usage of software

The HADDOCK2 web application has on average 100 jobs per day and over 50.000 registered users.
See https://rascar.science.uu.nl/stats

### HADDOCK3 vs HADDOCK2

1. HADDOCK3 is open source and HADDOCK2 could on request be run locally on command line
2. HADDOCK3 is a complete rewrite of HADDOCK2
3. HADDOCK3 is more modular and flexible, while HADDOCK2 can do one workflow
4. HADDOCK3 workflow aka configuration file is in toml format
5. HADDOCK3 accepts modules from the community

### HADDOCK3 web application vs HADDOCK2 application

The HADDOCK2 web application at https://rascar.science.uu.nl/haddock2.4/ only allows for docking.
With HADDOCK3 web application you can still do docking, but also pick from several other scenarios or build a workflow from scratch.

The HADDOCK3 web application can be run by anyone, while the HADDOCK2 web application is only available to the BonvinLab.
Pharmaceutical companies can run their own HADDOCK3 web application and their data can stay on their own network.

### Re-usablity of software

1. The workflow builder is a seperate piece of software that can be used in other projects to make a configuration file. You just need defined a JSON schema for the modules/nodes and use TOML format for the workflow output. See https://github.com/i-VRESSE/workflow-builder
2. The jobs are executed by the bartender web service, which written in Python and can handle running jobs in a locally, pilot job system, slurm batch scheduler or on the grid using DIRAC. See https://i-vresse-bartender.readthedocs.io/
3. Generic UI components are in own package called [haddock3-ui](https://github.com/i-VRESSE/haddock3-ui). The HADDOCK3 CLI also uses this package to render clusters.

### Implementation details

See https://github.com/i-VRESSE/haddock3-webapp?tab=readme-ov-file#web-application-for-haddock3 for
building blocks and how they are connected.
