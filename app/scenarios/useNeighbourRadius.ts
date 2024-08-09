import { useState } from "react";
import { Molecule } from "./AtomStructureSubForm.client";
import { RestraintsFlavour } from "./RestraintsFlavourPicker";
import { ActPassSelection } from "./ActPassSelection";
import { passiveFromActive } from "./restraints";

export function useNeighbourRadius({
  setBusy,
  safeFile,
  molecule,
  actpass,
  restraintsFlavour,
  onActPassChange,
}: {
  setBusy: (busy: boolean) => void;
  safeFile: string | undefined;
  molecule: Molecule;
  actpass: ActPassSelection;
  restraintsFlavour: RestraintsFlavour;
  onActPassChange?: (actpass: ActPassSelection) => void;
}): [number, (radius: number) => Promise<void>] {
  const [neighourRadius, setNeighourRadius] = useState(6.5);
  async function onNeighourRadiusChange(radius: number) {
    if (!onActPassChange || !safeFile) {
      return;
    }
    setBusy(true);
    try {
      const neighbours = await computeNeighbours({
        structure: safeFile,
        chain: molecule.targetChain,
        surface: molecule.surfaceResidues,
        active: actpass.active,
        passive: actpass.passive,
        restraintsFlavour,
        radius: neighourRadius,
      });
      onActPassChange({
        ...actpass,
        neighbours,
      });
      setNeighourRadius(radius);
    } finally {
      setBusy(false);
    }
  }

  return [neighourRadius, onNeighourRadiusChange];
}

export async function computeNeighbours({
  structure,
  chain,
  surface,
  active,
  passive,
  restraintsFlavour,
  radius,
}: {
  structure: string;
  chain: string;
  surface: number[];
  active: number[];
  passive: number[];
  restraintsFlavour: RestraintsFlavour;
  radius: number;
}): Promise<number[]> {
  if (
    !restraintsFlavour.activeNeighbours &&
    !restraintsFlavour.passiveNeighbours
  ) {
    return [];
  }
  let derivedActive: number[] = [];
  if (restraintsFlavour.activeNeighbours) {
    derivedActive = active;
  }
  if (restraintsFlavour.passiveNeighbours) {
    derivedActive = derivedActive.concat(passive);
  }
  return passiveFromActive(structure, chain, derivedActive, surface, radius);
}
