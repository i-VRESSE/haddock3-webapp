import { Structure, autoLoad } from "ngl";
import { useState } from "react";
import { strFromU8, gzip } from "fflate";

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
  activeResidues: ResidueSelection,
  surface: number[]
) {
  /*
  On CLI
  haddock3-restraints passive_from_active -c protein1activeResidues.chain protein1 protein1activeResidues.resno.join(',') >> protein1.actpass
*/
  const structure = await packAndEncode(file);
  const body = {
    structure,
    chain: activeResidues.chain,
    active: activeResidues.resno,
    surface,
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
  const structure = await packAndEncode(file);
  const body = {
    structure,
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


async function packAndEncode(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    gzip(data, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(btoa(strFromU8(data, true)));
    });
  });
}

async function preprocessPdb(file: File, fromChain: string, toChain: string) {
  const structure = await packAndEncode(file);
  const { error, data } = await client.POST("/preprocess_pdb", {
    body: {
      structure,
      from_chain: fromChain,
      to_chain: toChain,
    },
    parseAs: "text",
  });
  if (error) {
    console.error(error);
    throw new Error("Could not preprocess pdb");
  }
  return new File([data], file.name, { type: file.type });
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
  targetChain,
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
}) {
  const [molecule, setMolecule] = useState<Molecule | undefined>();
  const [showPassive, setShowPassive] = useState(false);
  const [showSurface, setShowSurface] = useState(false);

  async function handleStructureLoad(structure: Structure, file: File) {
    const chains = chainsFromStructure(structure);

    setMolecule({ structure, chains, file, originalFile: file });
  }

  async function handleChainChange(chain: string) {
    if (!molecule) {
      return;
    }
    const processed = await preprocessPdb(
      molecule.originalFile,
      chain,
      targetChain
    );
    const structure: Structure = await autoLoad(processed);
    const chains = chainsFromStructure(structure);
    await calculateAccessibility(processed, chains);
    setMolecule({
      structure,
      chains,
      file: processed,
      originalFile: molecule.originalFile,
    });
    const newSelection = {
      active: { chain: targetChain, resno: [] },
      passive: { chain: targetChain, resno: [] },
    };
    onActPassChange(newSelection);
  }

  function handleActiveResiduesChange(activeResidues: number[]) {
    const surfaceResidues = molecule!.chains[targetChain]
      .filter((r) => r.surface)
      .map((r) => r.resno);
    const activeSelection = {
      chain: actpass.active.chain,
      resno: filterBuriedResidues(
        actpass.active.chain,
        activeResidues,
        molecule!.chains
      ),
    };
    passiveFromActive(molecule!.file, activeSelection, surfaceResidues)
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
            surface={
              showSurface
                ? molecule.chains[targetChain]
                    .filter((r) => r.surface)
                    .map((r) => r.resno)
                : []
            }
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
              <Checkbox
                id="showsurface"
                disabled={
                  !Object.keys(molecule!.chains).every((c) => c === targetChain)
                }
                defaultChecked={showSurface}
                onCheckedChange={() => setShowSurface(!showSurface)}
              />
              <label htmlFor="showsurface" className="">
                Show surface residues
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
