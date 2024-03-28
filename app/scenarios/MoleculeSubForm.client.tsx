import { Structure } from "ngl";
import { useState } from "react";

import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { PDBFileInput } from "~/scenarios/PDBFileInput.client";
import { ChainSelect } from "~/scenarios/ChainSelect";
import { ResiduesSelect } from "~/scenarios/ResiduesSelect";
import { Molecule, chainsFromStructure } from "./molecule.client";
import { Viewer } from "./Viewer.client";
import { client } from "~/haddock3-restraints-client/client";

export type ResidueSelection = { chain: string; resno: number[] };
export type ActPassSelection = {
  active: ResidueSelection;
  passive: ResidueSelection;
};

export async function passiveFromActive(
  file: File,
  activeResidues: ResidueSelection
) {
  /*
  On CLI
  haddock3-restraints passive_from_active -c protein1activeResidues.chain protein1 protein1activeResidues.resno.join(',') >> protein1.actpass
*/
  const structure = await file.text();
  const { data, error } = await client.POST("/passive_from_active", {
    body: {
      structure: btoa(structure),
      chain: activeResidues.chain,
      active: activeResidues.resno,
      surface: [],
    },
  });
  if (error) {
    console.error(error);
    throw new Error("Could not calculate passive restraints");
  }
  return data;
}

export function MoleculeSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
}) {
  const [molecule, setMolecule] = useState<Molecule | undefined>();

  function handleStructureLoad(structure: Structure, file: File) {
    const chains = chainsFromStructure(structure);
    setMolecule({ structure, chains, file });
  }

  function handleChainChange(chain: string) {
    const newSelection = {
      active: { chain, resno: [] },
      passive: { chain, resno: [] },
    };
    onActPassChange(newSelection);
  }

  function handleActiveResiduesChange(activeResidues: number[]) {
    passiveFromActive(molecule!.file, {
      chain: actpass.active.chain,
      resno: activeResidues,
    })
      .then((passiveResidues) => {
        onActPassChange({
          active: { chain: actpass.active.chain, resno: activeResidues },
          passive: { chain: actpass.passive.chain, resno: passiveResidues },
        });
      })
      .catch((error) => {
        console.error(error);
        // TODO show error to user
      });
  }

  return (
    <fieldset className="border border-solid border-primary p-3">
      <legend className="">{legend}</legend>
      <FormItem name={name} label="Structure">
        <PDBFileInput
          name={name}
          required
          onStructureLoad={handleStructureLoad}
        />
        <FormDescription>{description}</FormDescription>
      </FormItem>
      <div className="h-[500px] w-full">
        {molecule ? (
          <Viewer
            structure={molecule?.structure}
            chain={actpass.active.chain}
          />
        ) : (
          <p>Load a structure first</p>
        )}
      </div>
      <FormItem name={`${name}-chain`} label="Chain">
        {molecule ? (
          <ChainSelect
            chains={Object.keys(molecule.chains)}
            onSelect={handleChainChange}
            selected={actpass.active.chain}
          />
        ) : (
          <p>Load a structure first</p>
        )}
      </FormItem>
      <FormItem name={`${name}-active-residues`} label="Active residues">
        {actpass.active.chain ? (
          <ResiduesSelect
            options={molecule?.chains[actpass.active.chain] || []}
            selected={actpass.active.resno}
            onChange={handleActiveResiduesChange}
          />
        ) : (
          <p>Select a chain first</p>
        )}
      </FormItem>
    </fieldset>
  );
}
