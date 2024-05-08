import {
  ReactNode,
  RefCallback,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  Component as ReactComponent,
  ErrorInfo,
} from "react";
import {
  Component,
  PickingProxy,
  Stage,
  Structure,
  StructureComponent,
  StructureRepresentationType,
} from "ngl";
import { Button } from "~/components/ui/button";
import { useTheme } from "remix-themes";

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
  pickable = false,
  onPick,
  onHover,
}: {
  residues: number[];
  color: string;
  opacity: number;
  representation: StructureRepresentationType;
  hovered?: number[];
  pickable?: boolean;
  onPick?: (chain: string, residue: number) => void;
  onHover?: (chain: string, residue: number) => void;
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

  const onClick = useCallback(
    (pickinProxy: PickingProxy) => {
      if (onPick && pickinProxy?.atom?.resno && pickinProxy?.atom?.chainname) {
        onPick(pickinProxy.atom.chainname, pickinProxy.atom.resno);
      }
    },
    [onPick],
  );

  useEffect(() => {
    if (!onClick) {
      return;
    }
    if (pickable) {
      stage.signals.clicked.add(onClick);
    } else {
      stage.signals.clicked.remove(onClick);
    }
    return () => {
      if (onClick) {
        stage.signals.clicked.remove(onClick);
      }
    };
  }, [stage, pickable, onClick]);

  const onHoverCallback = useCallback(
    (pickinProxy: PickingProxy) => {
      if (onHover && pickinProxy?.atom?.resno && pickinProxy?.atom?.chainname) {
        onHover(pickinProxy.atom.chainname, pickinProxy.atom.resno);
      }
    },
    [onHover],
  );

  useEffect(() => {
    if (!onHoverCallback) {
      return;
    }
    if (pickable) {
      stage.signals.hovered.add(onHoverCallback);
    } else {
      stage.signals.hovered.remove(onHoverCallback);
    }
    return () => {
      if (onHoverCallback) {
        stage.signals.hovered.remove(onHoverCallback);
      }
    };
  }, [stage, pickable, onHoverCallback]);

  return null;
}

function isValidStructure(
  structure: Structure | undefined,
): structure is Structure {
  // Removing component of structure in stage
  // will modifies the structure so it contains no atoms, but the count does not reflect that
  return structure !== undefined && structure.atomStore.x !== undefined;
}

function isStructureComponent(
  component: Component,
): component is StructureComponent {
  return (component as StructureComponent).structure !== undefined;
}

function stageHasValidStructure(stage: Stage, name: string): boolean {
  const component = stage.getComponentsByName(name).first;
  if (!component) {
    return false;
  }
  return (
    isStructureComponent(component) && isValidStructure(component.structure)
  );
}

const NGLComponentContext = createContext<StructureComponent | undefined>(
  undefined,
);

export function useComponent() {
  const component = useContext(NGLComponentContext);
  if (!component) {
    throw new Error(
      "useNGLComponent must be used within a NGLComponentProvider",
    );
  }
  return component;
}

export function NGLComponent({
  structure,
  chain,
  children,
}: {
  structure: File;
  chain: string;
  children?: ReactNode;
}) {
  const stage = useStage();
  const [component, setComponent] = useState<StructureComponent | undefined>(
    undefined,
  );

  useEffect(() => {
    async function loadStructure() {
      stage.getComponentsByName(structure.name).dispose();
      const newComponent = await stage.loadFile(structure);
      if (!newComponent) {
        return;
      }
      stage.defaultFileRepresentation(newComponent);
      stage.autoView();
      setComponent(newComponent as StructureComponent);
    }
    loadStructure();
    return () => {
      stage.getComponentsByName(structure.name).dispose();
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
      if (!stageHasValidStructure(stage, component.name)) {
        return;
      }
      const stagedComponent = stage.getComponentsByObject(
        component.structure,
      ).first;
      if (!stagedComponent) {
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

export function NGLStage({
  onMouseLeave = () => {},
  children,
}: {
  children: ReactNode;
  onMouseLeave?: () => void;
}) {
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
        // stage.dispose();
      }
    };
  }, [stage]);

  //  TODO make height and width configurable
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseLeave={onMouseLeave}
    >
      <div ref={stageElementRef} className="h-full w-full "></div>
      {stage && (
        <>
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              title="Center all"
              className="h-5 w-5"
              onClick={(e) => {
                e.preventDefault();
                stage.autoView();
              }}
            >
              ◎
            </Button>
          </div>
          <StageReactContext.Provider value={stage}>
            {children}
          </StageReactContext.Provider>
        </>
      )}
    </div>
  );
}

class ErrorBoundary extends ReactComponent<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong. See DevTools console</h1>;
    }

    return this.props.children;
  }
}

export function Viewer({
  structure,
  chain,
  active,
  passive,
  surface,
  neighbours = [],
  pickable = false,
  onPick,
  higlightResidue,
  onHover,
  onMouseLeave = () => {},
}: {
  structure: File;
  chain: string;
  active: number[];
  passive: number[];
  surface: number[];
  neighbours?: number[];
  pickable?: boolean;
  onPick?: (chain: string, residue: number) => void;
  higlightResidue?: number | undefined;
  onHover?: (chain: string, residue: number) => void;
  onMouseLeave?: () => void;
}) {
  const [theme] = useTheme();
  const isDark = theme === "dark";
  const activeColor = isDark ? "green" : "lime";
  const passiveColor = isDark ? "orange" : "yellow";
  const opacity = isDark ? 0.7 : 0.5;
  return (
    <ErrorBoundary>
      <NGLStage onMouseLeave={onMouseLeave}>
        <NGLComponent structure={structure} chain={chain}>
          {higlightResidue && (
            <NGLResidues
              residues={[higlightResidue]}
              color={activeColor}
              opacity={1.0}
              representation="spacefill"
            />
          )}
          <NGLResidues
            residues={active}
            color={activeColor}
            opacity={1.0}
            representation="ball+stick"
            pickable={pickable}
            onPick={onPick}
            onHover={onHover}
          />
          <NGLResidues
            residues={active}
            color={activeColor}
            opacity={opacity}
            representation="spacefill"
          />
          <NGLResidues
            residues={passive}
            color={passiveColor}
            opacity={opacity}
            representation="spacefill"
          />
          <NGLResidues
            residues={neighbours}
            color={passiveColor}
            opacity={opacity}
            representation="spacefill"
          />
          <NGLResidues
            residues={surface}
            color={"sky"}
            opacity={0.5}
            representation="surface"
          />
        </NGLComponent>
      </NGLStage>
    </ErrorBoundary>
  );
}
