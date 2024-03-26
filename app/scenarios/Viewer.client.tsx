import { useEffect, useRef, useState } from "react";
import { Stage, Structure } from "ngl";

export type Residue = { resno: number; seq: string };
type Chains = Record<string, Residue[]>;
export type Molecule = { structure: Structure; chains: Chains };

export function chainsFromStructure(structure: Structure) {
  const chains: Chains = {};
  structure.eachChain((c) => {
    const chainName = c.chainname;
    const residues: Residue[] = [];
    c.eachResidue((r) => {
      residues.push({
        resno: r.resno,
        seq: r.getResname1(),
      });
    });
    chains[chainName] = residues;
  });
  return chains;
}

export function Viewer({ structure }: { structure: Structure }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      return;
    }
    if (!viewportRef.current) {
      return;
    }

    // Create Stage object
    stage.current = new Stage(viewportRef.current);
    let backgroundColor = "white";
    if (document?.documentElement?.classList.contains("dark")) {
      backgroundColor = "black";
    } else if (document?.documentElement?.classList.contains("light")) {
      backgroundColor = "white";
    } else if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
      backgroundColor = "black";
    }
    stage.current.setParameters({ backgroundColor });

    if (stage.current === null) {
      return;
    }
    stage.current.removeAllComponents();
    const o = stage.current.addComponentFromObject(structure);
    if (o === undefined) {
      console.error("Could not load structure");
      return;
    }
    o.addRepresentation("cartoon", { sele: "protein" });
    o.addRepresentation("ball+stick", { sele: "ligand" });
    o.addRepresentation("base", { sele: "nucleic" });

    o.autoView();
    setIsLoaded(true);

    // TODO clean up messes up the rendering, need to figure out why
    // return () => {
    //   if (stage.current && file) {
    //     const comps = stage.current.getComponentsByName(file.name);
    //     comps.dispose();
    //   }
    //   if (stage.current) {
    //     stage.current.dispose();
    //   }
    // };
  }, [structure, isLoaded]);

  return <div ref={viewportRef} className="h-full w-full"></div>;
}
