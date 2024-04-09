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
  PickingProxy,
  Stage,
  Structure,
  StructureComponent,
  StructureRepresentationType,
} from "ngl";
import { Button } from "~/components/ui/button";

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
    [onPick]
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
    [onHover]
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
    stage.getComponentsByName(structure.name).dispose();
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
      const stagedComponent = stage.getComponentsByObject(
        component.structure
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
        // stage.dispose();
      }
    };
  }, [stage]);

  //  TODO make height and width configurable
  return (
    <div className="relative h-full w-full overflow-hidden">
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
  activePickable,
  onActivePick,
  higlightResidue,
  onHover,
}: {
  structure: Structure;
  chain: string;
  active: number[];
  passive: number[];
  surface: number[];
  activePickable?: boolean;
  onActivePick?: (chain: string, residue: number) => void;
  higlightResidue?: number | undefined;
  onHover?: (chain: string, residue: number) => void;
}) {
  // TODO use theme to color residues so they are better visible in dark theme

  return (
    <ErrorBoundary>
      <NGLStage>
        <NGLComponent structure={structure} chain={chain}>
          {higlightResidue && (
            <NGLResidues
              residues={[higlightResidue]}
              color="green"
              opacity={1.0}
              representation="spacefill"
            />
          )}
          <NGLResidues
            residues={active}
            color="green"
            opacity={1.0}
            representation="ball+stick"
            pickable={activePickable}
            onPick={onActivePick}
            onHover={onHover}
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
          <NGLResidues
            residues={surface}
            color="orange"
            opacity={0.1}
            representation="spacefill"
          />
        </NGLComponent>
      </NGLStage>
    </ErrorBoundary>
  );
}
