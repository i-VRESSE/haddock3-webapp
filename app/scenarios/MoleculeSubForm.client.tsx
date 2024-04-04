import { Structure } from "ngl";
import { useState } from "react";

import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { PDBFileInput } from "~/scenarios/PDBFileInput.client";
import { ChainSelect } from "~/scenarios/ChainSelect";
import { ResiduesSelect } from "~/scenarios/ResiduesSelect";
import {
  Chains,
  Molecule,
  Residue,
  chainsFromStructure,
} from "./molecule.client";
import { Viewer } from "./Viewer.client";
import { client } from "~/haddock3-restraints-client/client";
import { Checkbox } from "~/components/ui/checkbox";

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
  const body = {
    structure: btoa(structure),
    chain: activeResidues.chain,
    active: activeResidues.resno,
    surface: [],
  };
  const { data, error } = await client.POST("/passive_from_active", {
    body,
  });
  if (error) {
    console.error(error);
    throw new Error("Could not calculate passive restraints");
  }
  return data;
}

async function calculateAccessibility(file: File, chains: Chains) {
  const structure = await file.text();
  const body = {
    structure: btoa(structure),
    cutoff: 0.4,
  };
  const { data, error } = await client.POST("/calc_accessibility", {
    body,
  });
  if (error) {
    console.error(error);
    return;
  }
  Object.entries(data).forEach(([chain, surfaceResidues]) => {
    if (!surfaceResidues) {
      return;
    }
    chains[chain].forEach((residue: Residue) => {
      residue.surface = surfaceResidues.includes(residue.resno);
    });
  });
}

function filterBuriedResidues(
  chain: string,
  residues: number[],
  chains: Chains
) {
  return residues.filter((resno) => {
    const residue = chains[chain].find((r) => r.resno === resno);
    return residue && residue.surface;
  });
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
  const [showPassive, setShowPassive] = useState(false);

  async function handleStructureLoad(structure: Structure, file: File) {
    const chains = chainsFromStructure(structure);
    await calculateAccessibility(file, chains);
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
      resno: filterBuriedResidues(
        actpass.active.chain,
        activeResidues,
        molecule!.chains
      ),
    })
      .then((passiveResidues) => {
        const filteredPassiveResidues = filterBuriedResidues(
          actpass.passive.chain,
          passiveResidues,
          molecule!.chains
        );
        onActPassChange({
          active: { chain: actpass.active.chain, resno: activeResidues },
          passive: {
            chain: actpass.passive.chain,
            resno: filteredPassiveResidues,
          },
        });
      })
      .catch((error) => {
        onActPassChange({
          active: { chain: actpass.active.chain, resno: activeResidues },
          passive: { chain: actpass.passive.chain, resno: [] },
        });
        console.error(error);
        // TODO show error to user
      });
  }

  return (
    <fieldset className="border border-solid border-primary p-3">
      <legend>{legend}</legend>
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
            active={actpass.active.resno}
            passive={showPassive ? actpass.passive.resno : []}
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
          <>
            <ResiduesSelect
              options={molecule?.chains[actpass.active.chain] || []}
              selected={actpass.active.resno}
              onChange={handleActiveResiduesChange}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showpassive"
                defaultChecked={showPassive}
                onCheckedChange={() => setShowPassive(!showPassive)}
              />
              <label htmlFor="showpassive" className="">
                Show passive restraints
              </label>
            </div>
          </>
        ) : (
          <p>Select a chain first</p>
        )}
      </FormItem>
    </fieldset>
  );
}
