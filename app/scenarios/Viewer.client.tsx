import {
  ReactNode,
  RefCallback,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import {
  Stage,
  Structure,
  StructureComponent,
  StructureRepresentationType,
} from "ngl";

function currentBackground() {
  let backgroundColor = "white";
  if (document?.documentElement?.classList.contains("dark")) {
    backgroundColor = "black";
  } else if (document?.documentElement?.classList.contains("light")) {
    backgroundColor = "white";
  } else if (window?.matchMedia("(prefers-color-scheme: dark)").matches) {
    backgroundColor = "black";
  }
  return backgroundColor;
}

const StageReactContext = createContext<Stage | undefined>(undefined);

function useStage() {
  const stage = useContext(StageReactContext);
  if (!stage) {
    throw new Error("useStage must be used within a StageProvider");
  }
  return stage;
}

export function NGLResidues({
  residues,
  color,
  opacity,
  representation,
}: {
  residues: number[];
  color: string;
  opacity: number;
  representation: StructureRepresentationType;
}) {
  const name = useId();
  const stage = useStage();
  const component = useComponent();

  useEffect(() => {
    const repr = stage.getRepresentationsByName(name).first;
    if (repr) {
      repr.dispose();
    }
    component.addRepresentation(representation, {
      name,
      sele: "not all",
      color,
      opacity,
    });
    return () => {
      const repr = stage.getRepresentationsByName(name).first;
      if (repr) {
        repr.dispose();
      }
    };
  }, [stage, component, color, opacity, name, representation]);

  useEffect(() => {
    const repr = stage.getRepresentationsByName(name).first;
    if (repr) {
      const sortedResidues = [...residues].sort((a, b) => a - b);
      const sel = sortedResidues.length ? sortedResidues.join(", ") : "not all";
      repr.setSelection(sel);
    }
  }, [residues, name, stage]);

  return null;
}

const NGLComponentContext = createContext<StructureComponent | undefined>(
  undefined
);

export function useComponent() {
  const component = useContext(NGLComponentContext);
  if (!component) {
    throw new Error(
      "useNGLComponent must be used within a NGLComponentProvider"
    );
  }
  return component;
}

export function NGLComponent({
  structure,
  chain,
  children,
}: {
  structure: Structure;
  chain: string;
  children?: ReactNode;
}) {
  const stage = useStage();
  const [component, setComponent] = useState<StructureComponent | undefined>(
    undefined
  );

  useEffect(() => {
    const component = stage.addComponentFromObject(structure);
    if (!component) {
      return;
    }
    stage.defaultFileRepresentation(component);
    stage.autoView();
    setComponent(component as StructureComponent);
    return () => {
      if (component) {
        stage.removeComponent(component);
      }
    };
  }, [stage, structure]);

  useEffect(() => {
    if (!component) {
      return;
    }
    if (chain === "") {
      component.setSelection("");
    } else {
      component.setSelection(`:${chain}`);
    }
    stage.autoView();
    return () => {
      if (!component) {
        return;
      }
      component.setSelection("");
    };
  }, [stage, chain, component]);

  return (
    <>
      {component && (
        <NGLComponentContext.Provider value={component}>
          {children}
        </NGLComponentContext.Provider>
      )}
    </>
  );
}

export function NGLStage({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>();

  const stageElementRef: RefCallback<HTMLElement> = useCallback((element) => {
    if (element) {
      const backgroundColor = currentBackground();
      const currentStage = new Stage(element, { backgroundColor });
      setStage(currentStage);
    }
  }, []);

  useEffect(() => {
    return (): void => {
      if (stage) {
        stage.dispose();
      }
    };
  }, [stage]);

  return (
    <>
      {/* TODO make height and width configurable */}
      <div ref={stageElementRef} className="h-full w-full" />
      {stage && (
        <StageReactContext.Provider value={stage}>
          {children}
        </StageReactContext.Provider>
      )}
    </>
  );
}

export function Viewer({
  structure,
  chain,
  active,
  passive,
}: {
  structure: Structure;
  chain: string;
  active: number[];
  passive: number[];
}) {
  return (
    <NGLStage>
      <NGLComponent structure={structure} chain={chain}>
        <NGLResidues
          residues={active}
          color="green"
          opacity={1.0}
          representation="ball+stick"
        />
        <NGLResidues
          residues={active}
          color="green"
          opacity={0.3}
          representation="spacefill"
        />
        <NGLResidues
          residues={passive}
          color="yellow"
          opacity={0.3}
          representation="spacefill"
        />
      </NGLComponent>
    </NGLStage>
  );
}
