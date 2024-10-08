import { useState } from "react";
import { calculateAccessibility } from "./restraints";

export function useSurfaceCutoff({
  setBusy,
  setSurfaceResidues,
  safeFile,
  targetChain,
}: {
  setBusy: (busy: boolean) => void;
  setSurfaceResidues: (surfaceResidues: number[]) => void;
  safeFile: string | undefined;
  targetChain: string;
}): [number, (cutoff: number) => Promise<void>] {
  const [surfaceCutoff, setSurfaceCutoff] = useState(0.15);

  async function onSurfaceCutoffChange(cutoff: number) {
    if (!safeFile) {
      return;
    }
    setBusy(true);
    try {
      const [surfaceResidues, error] = await calculateAccessibility(
        safeFile,
        cutoff,
      );
      if (error) {
        console.error(error);
        setBusy(false);
        return;
      }
      setSurfaceResidues(surfaceResidues[targetChain] || []);
    } finally {
      setBusy(false);
    }
    setSurfaceCutoff(cutoff);
  }

  return [surfaceCutoff, onSurfaceCutoffChange];
}
