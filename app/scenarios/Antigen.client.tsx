import { Structure, autoLoad } from "ngl";
import { useState } from "react";

import { chainsFromStructure } from "./molecule.client";
import { Viewer } from "./Viewer.client";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  ActPassSelection,
  PreprocessPipeline,
  Molecule,
  calclulateRestraints,
  ResiduesSubForm,
  MoleculeSubFormWrapper,
  HiddenFileInput,
  ProcessedStructure,
  RestraintsErrors,
  UserStructure,
} from "./MoleculeSubForm.client";

export type Flavour = "surf" | "pass" | "actpass";
function AntigenFlavourPicker({
  value,
  onChange,
}: {
  value: Flavour;
  onChange: (value: Flavour) => void;
}) {
  return (
    <RadioGroup
      defaultValue={value}
      onValueChange={(value) => onChange(value as Flavour)}
      className="pt-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem
          value="surf"
          id="antigen-flavour-surf"
          className="bg-inherit"
        />
        <Label htmlFor="antigen-flavour-surf">
          Treat surface residues as passive (in tutorial scenario 1)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem
          value="pass"
          id="antigen-flavour-pass"
          className="bg-inherit"
        />
        <Label htmlFor="antigen-flavour-pass">
          Treat selected residues and their surface neighbours as passive (in
          tutorial scenario 2a)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        {/* This is what ResiduesSubForm currently does */}
        <RadioGroupItem
          value="actpass"
          id="antigen-flavour-actpass"
          className="bg-inherit"
        />
        <Label htmlFor="antigen-flavour-actpass">
          Treat selected residues as active and their surface neighbours as
          passive (in tutorial scenario 2b)
        </Label>
      </div>
    </RadioGroup>
  );
  // TODO maybe??, add other combinations like
  // - selected residues as active and no surface residues
  // - selected residues as passive and no surface residues
}

export function AntigenSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
  targetChain,
  antigenFlavour,
  onFlavourChange,
  preprocessPipeline = "",
  accessibilityCutoff = 0.4,
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
  antigenFlavour: Flavour;
  onFlavourChange: (flavour: Flavour) => void;
  preprocessPipeline?: PreprocessPipeline;
  accessibilityCutoff?: number;
}) {
  const [molecule, setMolecule] = useState<Molecule | undefined>();

  async function onUserStructureAndChainSelect(
    file: File,
    chain: string,
    chains: string[],
  ) {
    const restraints = await calclulateRestraints(
      file,
      chain,
      targetChain,
      preprocessPipeline,
      accessibilityCutoff,
    );

    const structure: Structure = await autoLoad(restraints.file);
    const residues = chainsFromStructure(structure)[targetChain];
    const newMolecule: Molecule = {
      userFile: file,
      userChains: chains,
      userSelectedChain: chain,
      targetChain,
      residues,
      file: restraints.file,
      surfaceResidues: restraints.surfaceResidues,
    };
    if (restraints.errors) {
      newMolecule.errors = restraints.errors;
    }
    setMolecule(newMolecule);
    const newSelection = {
      active: [],
      passive: [],
      chain: targetChain,
      bodyRestraints: restraints.bodyRestraints,
    };
    onActPassChange(newSelection);
  }

  async function changeAntigenFlavour(flavour: Flavour) {
    if (!molecule) {
      return;
    }

    onFlavourChange(flavour);
    if (flavour === "surf") {
      const newSelection = {
        active: [],
        passive: molecule.surfaceResidues,
        chain: targetChain,
        bodyRestraints: actpass.bodyRestraints,
      };
      onActPassChange(newSelection);
    } else {
      const newSelection = {
        active: [],
        passive: [],
        chain: targetChain,
        bodyRestraints: actpass.bodyRestraints,
      };
      onActPassChange(newSelection);
    }
  }

  const flavourPicker = (
    <AntigenFlavourPicker
      value={antigenFlavour}
      onChange={changeAntigenFlavour}
    />
  );
  let subform = null;
  if (molecule) {
    if (antigenFlavour === "actpass") {
      subform = (
        <ResiduesSubForm
          actpass={actpass}
          molecule={molecule}
          onActPassChange={onActPassChange}
        >
          {flavourPicker}
        </ResiduesSubForm>
      );
    } else if (antigenFlavour === "surf") {
      subform = (
        <div>
          <div className="h-[500px] w-full">
            <Viewer
              structure={molecule.file}
              chain={molecule.targetChain}
              active={[]}
              passive={[]}
              surface={molecule.surfaceResidues}
            />
          </div>
          {flavourPicker}
          {/* TODO on hover of a surface residue numbers highlight in ngl and the reverse */}
          <Label>Surface residues</Label>
          <div>{molecule.surfaceResidues.join(", ")}</div>
        </div>
      );
    } else if (antigenFlavour === "pass") {
      subform = (
        <ResiduesSubForm
          actpass={actpass}
          molecule={molecule}
          onActPassChange={onActPassChange}
          label="Passive residues"
        >
          {flavourPicker}
        </ResiduesSubForm>
      );
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
          />
          {molecule.errors ? (
            <RestraintsErrors errors={molecule.errors} />
          ) : (
            subform
          )}
        </>
      ) : (
        <>
          <UserStructure name={name} onChange={onUserStructureAndChainSelect} />
        </>
      )}
    </MoleculeSubFormWrapper>
  );
}
