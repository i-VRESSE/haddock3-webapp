import { useEffect, useRef, useState } from "react";
import { Stage, Structure } from "ngl";

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
    window.addEventListener(
      "resize",
      function () {
        if (stage.current === null) {
          return;
        }
        stage.current.handleResize();
      },
      false
    );
    stage.current.removeAllComponents();
    const component = stage.current.addComponentFromObject(structure);
    if (!component) {
      console.error("Could not load structure");
      return;
    }
    component.addRepresentation("cartoon", { sele: "polymer" });
    component.addRepresentation("ball+stick", { sele: "ligand" });
    component.addRepresentation("base", { sele: "nucleic" });

    component.autoView();

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
