import { Structure, autoLoad } from "ngl";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTheme } from "remix-themes";

import { ActPassSelection } from "./ActPassSelection";
import { HiddenFileInput } from "./HiddenFileInput";
import { RestraintsErrorsReport } from "./RestraintsErrorsReport";
import { UserStructure } from "./UserStructure";
import { MoleculeSubFormWrapper } from "./MoleculeSubFormWrapper";
import { Residue, chainsFromStructure } from "./molecule.client";
import {
  PreprocessPipeline,
  RestraintsErrors,
  processUserStructure,
} from "./restraints";
import { Button } from "~/components/ui/button";
import { LinkToFile } from "./LinkToFile";
import { ChainSelect } from "./ChainSelect";
import { ActPass } from "./ResiduesSelect";

export interface Molecule {
  userFile: File;
  userChains: string[];
  userSelectedChain: string;
  file: File;
  targetChain: string;
  residues: Residue[];
  surfaceResidues: number[];
  errors?: RestraintsErrors;
}

export interface ResidueSubFormProps {
  molecule: Molecule;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  setSurfaceResidues: (surfaceResidues: number[]) => void;
}

function ProcessedStructure({
  molecule,
  bodyRestraints,
  onChainChange,
  onRefreshStructure,
}: {
  molecule: Molecule;
  bodyRestraints: string;
  onChainChange: (chain: string) => void;
  onRefreshStructure: () => void;
}) {
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
  return (
    <>
      <div>
        <div className="flex items-center">
          User uploaded structure:{" "}
          <LinkToFile file={molecule.userFile}>
            {molecule.userFile.name}
          </LinkToFile>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRefreshStructure();
            }}
            title="Upload another structure"
            variant="ghost"
            size="icon"
          >
            <RefreshCw />
          </Button>
        </div>
        <div>
          Selected chain{" "}
          <ChainSelect
            chains={molecule.userChains}
            onSelect={onChainChange}
            selected={molecule.userSelectedChain}
          ></ChainSelect>{" "}
          has been filtered{" "}
          {molecule.userSelectedChain !== molecule.targetChain && (
            <span>
              and renamed to <b>{molecule.targetChain}</b>
            </span>
          )}{" "}
          during processing.
        </div>
        <div>
          Processed structure:{" "}
          <LinkToFile file={molecule.file}>{molecule.file.name}</LinkToFile>
        </div>
        <div>
          {bodyRestraints && (
            <details>
              <summary>Body restraints</summary>
              <pre className="overflow-auto" style={style}>
                {bodyRestraints}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}

export function AtomStructureSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
  targetChain,
  preprocessPipeline = "",
  accessibilityCutoff = 0.4, // Negative means no surface calculation, all residues treated as surface
  ResiduesSubForm,
  allSelect = false,
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
  preprocessPipeline?: PreprocessPipeline;
  accessibilityCutoff?: number;
  ResiduesSubForm: React.ComponentType<ResidueSubFormProps>;
  allSelect?: false | ActPass;
}) {
  const [molecule, setMolecule] = useState<Molecule | undefined>();

  async function onUserStructureAndChainSelect(
    file: File,
    chain: string,
    chains: string[],
  ) {
    const restraints = await processUserStructure(
      file,
      chain,
      targetChain,
      preprocessPipeline,
      accessibilityCutoff,
    );
    const structure: Structure = await autoLoad(restraints.file);
    const residues = chainsFromStructure(structure)[targetChain];
    residues.forEach((residue) => {
      residue.surface =
        accessibilityCutoff > 0
          ? restraints.surfaceResidues.includes(residue.resno)
          : true;
    });
    const newMolecule: Molecule = {
      userFile: file,
      userChains: chains,
      userSelectedChain: chain,
      targetChain,
      residues,
      file: restraints.file,
      surfaceResidues:
        accessibilityCutoff > 0
          ? restraints.surfaceResidues
          : residues.map((r) => r.resno),
    };
    if (restraints.errors) {
      newMolecule.errors = restraints.errors;
    }
    setMolecule(newMolecule);
    const newSelection = {
      active: allSelect === "act" ? residues.map((r) => r.resno) : [],
      passive: allSelect === "pass" ? residues.map((r) => r.resno) : [],
      neighbours: [],
      chain: targetChain,
      bodyRestraints: restraints.bodyRestraints,
    };
    onActPassChange(newSelection);
  }

  function setMoleculeSurfaceResidues(surfaceResidues: number[]) {
    if (molecule) {
      const residues = molecule.residues.map((residue) => {
        residue.surface = surfaceResidues.includes(residue.resno);
        return residue;
      });
      setMolecule({ ...molecule, residues, surfaceResidues });
    }
  }

  return (
    <MoleculeSubFormWrapper legend={legend} description={description}>
      {molecule ? (
        <>
          <HiddenFileInput name={name} file={molecule.file} />
          <ProcessedStructure
            molecule={molecule}
            bodyRestraints={actpass.bodyRestraints}
            onChainChange={(chain) =>
              onUserStructureAndChainSelect(
                molecule.userFile,
                chain,
                molecule.userChains,
              )
            }
            onRefreshStructure={() => setMolecule(undefined)}
          />
          {molecule.errors ? (
            <RestraintsErrorsReport errors={molecule.errors} />
          ) : (
            <ResiduesSubForm
              molecule={molecule}
              actpass={actpass}
              onActPassChange={onActPassChange}
              setSurfaceResidues={setMoleculeSurfaceResidues}
            />
          )}
        </>
      ) : (
        <UserStructure name={name} onChange={onUserStructureAndChainSelect} />
      )}
    </MoleculeSubFormWrapper>
  );
}
