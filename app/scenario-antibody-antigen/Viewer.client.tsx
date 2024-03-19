import { useEffect, useRef, useState } from "react";
import { Stage } from "ngl";

export function Viewer({ file }: { file: File | undefined }) {
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

    if (stage.current === null || file === undefined) {
      return;
    }
    stage.current.loadFile(file, { ext: "pdb" }).then((o) => {
      if (o === undefined) {
        console.error("Could not load file");
        return;
      }
      o.addRepresentation("cartoon", { sele: "protein" });
      o.addRepresentation("ball+stick", { sele: "ligand" });
      o.addRepresentation("base", { sele: "nucleic" });

      o.autoView();
      setIsLoaded(true);
    });

    // return () => {
    //   if (stage.current && file) {
    //     const comps = stage.current.getComponentsByName(file.name);
    //     comps.dispose();
    //   }
    //   if (stage.current) {
    //     stage.current.dispose();
    //   }
    // };
  }, [file, isLoaded]);

  return <div ref={viewportRef} className="h-full w-full"></div>;
}
