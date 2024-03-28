import { useEffect, useRef, useState } from "react";
import { Stage, Structure, StructureComponent } from "ngl";

export function Viewer({
  structure,
  chain,
}: {
  structure: Structure;
  chain?: string;
}) {
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
    stage.current.defaultFileRepresentation(component);

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

  useEffect(() => {
    if (stage.current === null) {
      return;
    }

    stage.current.eachRepresentation((repr) => {
      const selection = chain ? `:${chain}` : "";
      // TODO figure out how to set selection
      // repr.setSelection(selection);
    });
  }, [chain]);

  return <div ref={viewportRef} className="h-full w-full"></div>;
}