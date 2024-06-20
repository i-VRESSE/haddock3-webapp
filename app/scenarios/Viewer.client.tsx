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
  useMemo,
} from "react";
import {
  ColormakerRegistry,
  Component,
  PickingProxy,
  Stage,
  Structure,
  StructureComponent,
  StructureRepresentationType,
} from "ngl";
import { Button } from "~/components/ui/button";
import { useTheme } from "remix-themes";
import { Hetero } from "./Hetero";

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
  opacity = 1.0,
  chain = "",
  representation,
}: {
  residues: number[];
  color: string;
  opacity?: number;
  chain?: string;
  representation: StructureRepresentationType;
}) {
  const name = useId();
  const stage = useStage();
  const component = useComponent();

  const selection = useMemo(() => {
    const sortedResidues = [...residues].sort((a, b) => a - b);
    if (sortedResidues.length) {
      const newSelection = sortedResidues.join(", ");
      if (chain) {
        return `:${chain} and ${newSelection}`;
      } else {
        return newSelection;
      }
    }
    return "not all";
  }, [residues, chain]);

  useEffect(() => {
    component.addRepresentation(representation, {
      name,
      sele: selection,
      color,
      opacity,
    });
    return () => {
      const repr = stage.getRepresentationsByName(name).first;
      if (repr) {
        repr.dispose();
      }
    };
    // to not (re)create new representation when selection changes, keep it out of dep list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, component, color, opacity, name, representation]);

  useEffect(() => {
    const repr = stage.getRepresentationsByName(name).first;
    if (repr) {
      repr.setSelection(selection);
    }
  }, [selection, name, stage]);

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

// List from https://github.com/nglviewer/ngl/blob/5d64dbe6769448e0f33080e9ac957a70a0973a13/src/component/structure-component.ts#L52-L79
const defaultRepresentationNames = new Set([
  "angle",
  "axes",
  "backbone",
  "ball+stick",
  "base",
  "cartoon",
  "contact",
  "dihedral",
  "dihedral-histogram",
  "distance",
  "dot",
  "helixorient",
  "hyperball",
  "label",
  "licorice",
  "line",
  "molecularsurface",
  "point",
  "ribbon",
  "rocket",
  "rope",
  "slice",
  "spacefill",
  "surface",
  "trace",
  "tube",
  "unitcell",
  "validation",
]);

export function NGLComponent({
  structure,
  chain,
  opacity = 1.0,
  children,
}: {
  structure: File;
  chain: string;
  opacity?: number;
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
    stage.eachRepresentation((repr) => {
      // representations created with defaultFileRepresentation have default name
      // while nested representations have unique names generated with useId hook
      if (
        repr.parent.name === component.name &&
        defaultRepresentationNames.has(repr.name)
      ) {
        repr.setParameters({ opacity });
      }
    });
    stage.viewer.requestRender();
  }, [opacity, component, stage]);

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
  onPick,
  onHover,
  children,
}: {
  children: ReactNode;
  onPick?: (
    chain: string,
    residue: number,
    componentName: string,
    resname: string,
  ) => void;
  onHover?: (
    chain: string,
    residue: number,
    componentName: string,
    resname: string,
  ) => void;
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

  const onClick = useCallback(
    (pickinProxy: PickingProxy) => {
      if (onPick && pickinProxy?.atom?.resno && pickinProxy?.atom?.chainname) {
        onPick(
          pickinProxy.atom.chainname,
          pickinProxy.atom.resno,
          pickinProxy.component.name,
          pickinProxy.atom.resname,
        );
      }
    },
    [onPick],
  );

  useEffect(() => {
    if (!onClick || !stage) {
      return;
    }
    stage.signals.clicked.add(onClick);
    return () => {
      if (onClick) {
        stage.signals.clicked.remove(onClick);
      }
    };
  }, [stage, onClick]);

  const onHoverCallback = useCallback(
    (pickinProxy: PickingProxy) => {
      if (onHover && pickinProxy?.atom?.resno && pickinProxy?.atom?.chainname) {
        onHover(
          pickinProxy.atom.chainname,
          pickinProxy.atom.resno,
          pickinProxy.component.name,
          pickinProxy.atom.resname,
        );
      }
    },
    [onHover],
  );

  useEffect(() => {
    if (!onHoverCallback || !stage) {
      return;
    }
    stage.signals.hovered.add(onHoverCallback);
    return () => {
      if (onHoverCallback) {
        stage.signals.hovered.remove(onHoverCallback);
      }
    };
  }, [stage, onHoverCallback]);

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

export class ErrorBoundary extends ReactComponent<
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

/**
 * Use single surface to display multiple colors of residue sets
 */
export function NGLSurface({
  active = [],
  passive = [],
  neighbours = [],
  highlight,
  activeColor = "green",
  passiveColor = "yellow",
  neighboursColor = "orange",
  highlightColor = "red",
  defaultColor = "white",
}: {
  active: number[];
  passive: number[];
  neighbours: number[];
  highlight?: number;
  activeColor?: string;
  passiveColor?: string;
  defaultColor?: string;
  highlightColor?: string;
  neighboursColor?: string;
}) {
  const name = useId();

  const schemeId = useMemo(() => {
    const oldSchemeId = Object.keys(ColormakerRegistry.userSchemes).find(
      (key) => key.endsWith(`|${name}`),
    );
    if (oldSchemeId) {
      ColormakerRegistry.removeScheme(oldSchemeId);
    }
    return ColormakerRegistry.addSelectionScheme(
      [
        [highlightColor, `${highlight}` ?? "not all", undefined],
        [activeColor, active.join(", "), undefined],
        [passiveColor, passive.join(", "), undefined],
        [neighboursColor, neighbours.join(", "), undefined],
        [defaultColor, "*", undefined],
      ],
      name,
    );
  }, [
    active,
    activeColor,
    defaultColor,
    highlight,
    highlightColor,
    name,
    neighbours,
    neighboursColor,
    passive,
    passiveColor,
  ]);

  const stage = useStage();
  const component = useComponent();

  useEffect(() => {
    component.addRepresentation("surface", {
      name,
      color: defaultColor,
    });
    return () => {
      const repr = stage.getRepresentationsByName(name).first;
      if (repr) {
        repr.dispose();
      }
    };
  }, [name, defaultColor, stage, component]);

  useEffect(() => {
    const repr = stage.getRepresentationsByName(name).first;
    if (repr) {
      repr.setColor(schemeId);
    }
  }, [schemeId, name, stage]);

  return null;
}

export function SimpleViewer({ structure }: { structure: File }) {
  return (
    <ErrorBoundary>
      <NGLStage>
        <NGLComponent structure={structure} chain="" />
      </NGLStage>
    </ErrorBoundary>
  );
}

export function Viewer({
  structure,
  chain,
  active,
  passive,
  renderSelectionAs = "surface",
  surface,
  neighbours = [],
  higlightResidue,
  onPick,
  onHover,
  onMouseLeave = () => {},
}: {
  structure: File;
  chain: string;
  active: number[];
  passive: number[];
  surface: number[];
  renderSelectionAs?: StructureRepresentationType;
  neighbours?: number[];
  higlightResidue?: number | undefined;
  onPick?: (chain: string, residue: number) => void;
  onHover?: (chain: string, residue: number) => void;
  onMouseLeave?: () => void;
}) {
  const [theme] = useTheme();
  const isDark = theme === "dark";
  const activeColor = isDark ? "green" : "lime";
  const passiveColor = isDark ? "orange" : "yellow";
  const opacity = 0.5;

  let representations = <></>;
  if (renderSelectionAs === "surface") {
    representations = (
      <NGLSurface
        active={active}
        passive={passive}
        neighbours={neighbours}
        highlight={higlightResidue}
        activeColor={activeColor}
        passiveColor={passiveColor}
        neighboursColor={passiveColor}
        defaultColor={"white"}
      />
    );
  } else {
    representations = (
      <>
        {higlightResidue && (
          <NGLResidues
            residues={[higlightResidue]}
            color={activeColor}
            opacity={1.0}
            representation={renderSelectionAs}
          />
        )}
        <NGLResidues
          residues={active}
          color={activeColor}
          opacity={opacity}
          representation={renderSelectionAs}
        />
        <NGLResidues
          residues={passive}
          color={passiveColor}
          opacity={opacity}
          representation={renderSelectionAs}
        />
        <NGLResidues
          residues={neighbours}
          color={passiveColor}
          opacity={opacity}
          representation={renderSelectionAs}
        />
        <NGLResidues
          residues={surface}
          color={"white"}
          opacity={opacity}
          representation={renderSelectionAs}
        />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <NGLStage onMouseLeave={onMouseLeave} onHover={onHover} onPick={onPick}>
        <NGLComponent structure={structure} chain={chain}>
          {representations}
        </NGLComponent>
      </NGLStage>
    </ErrorBoundary>
  );
}

export function LigandViewer({
  structure,
  selected,
  onPick,
  onHover,
  highlight,
  onMouseLeave,
}: {
  structure: File;
  selected: Hetero | undefined;
  onPick: (picked: string) => void;
  onHover: (hovering: string) => void;
  highlight: string | undefined;
  onMouseLeave?: () => void;
}) {
  const [theme] = useTheme();
  const isDark = theme === "dark";
  const activeColor = isDark ? "green" : "lime";
  const opacity = selected ? 0.05 : 1.0;
  const representations = (
    <>
      {highlight && (
        <NGLResidues
          residues={[parseInt(highlight.split("-")[2])]}
          color={activeColor}
          chain={highlight.split("-")[1]}
          opacity={1.0}
          representation={"spacefill"}
        />
      )}
      {selected && (
        <NGLResidues
          residues={[selected.resno]}
          chain={selected.chain}
          color={activeColor}
          opacity={1.0}
          representation={"spacefill"}
        />
      )}
    </>
  );

  function onLigandPick(
    chain: string,
    residue: number,
    componentName: string,
    resname: string,
  ) {
    onPick(`${resname}-${chain}-${residue}`);
  }

  function onLigandHover(
    chain: string,
    residue: number,
    componentName: string,
    resname: string,
  ) {
    onHover(`${resname}-${chain}-${residue}`);
  }

  return (
    <ErrorBoundary>
      <NGLStage
        onMouseLeave={onMouseLeave}
        onHover={onLigandHover}
        onPick={onLigandPick}
      >
        <NGLComponent structure={structure} chain={""} opacity={opacity}>
          {representations}
        </NGLComponent>
      </NGLStage>
    </ErrorBoundary>
  );
}
