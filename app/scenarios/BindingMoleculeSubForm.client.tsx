import { StructureRepresentationType } from "ngl";
import { useEffect, useMemo, useState } from "react";
import { useChunked } from "@i-vresse/haddock3-ui/useChunked";
import { ResidueHeaderItem } from "@i-vresse/haddock3-ui/toggles/ResidueHeader";

import { ActPassSelection } from "./ActPassSelection";
import { BIG_MOLECULE } from "./constants";
import { PreprocessPipeline } from "./restraints";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { MoleculeSettings } from "./MoleculeSettings";
import { ImportResidues } from "./ResiduesSelect";
import {
  ShowSurfaceBuriedToggles,
  useShowSurfaceBuriedToggles,
} from "./ShowSurfaceBuriedToggles";
import {
  AtomStructureSubForm,
  ResidueSubFormProps,
} from "./AtomStructureSubForm.client";
import { useSurfaceCutoff } from "./useSurfaceCutoff";
import { useSafeFile } from "./useSafeFile";
import { Viewer } from "@i-vresse/haddock3-ui";
import { useTheme } from "remix-themes";
import {
  FormDescription,
  Residue,
  ResidueCheckbox,
  ResidueNeighbourSelection,
  ResidueSelection,
  toggleResidue,
  useResidueChangeHandler,
} from "@i-vresse/haddock3-ui/toggles";

function BindingResiduesSelect({
  options,
  selected,
  onChange,
  onHover,
  highlight,
}: {
  options: Residue[];
  selected: ResidueNeighbourSelection;
  onChange: (selected: ResidueSelection) => void;
  onHover: (resno: number | undefined) => void;
  highlight: number | undefined;
}) {
  const [theme] = useTheme();
  const surface = useMemo(
    () => options.filter((r) => r.surface).map((r) => r.resno),
    [options],
  );
  const handleChange = useResidueChangeHandler({
    options,
    selected,
    onChange,
    filter: (resno: number) => surface.includes(resno),
  });
  const chunkSize = 10;
  const chunks = useChunked(options, chunkSize);

  function onActiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      act: filtered,
      pass: selected.pass,
    });
  }

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <div>
          <p className="text-[0.5rem]">&nbsp;</p>
          <div className="inline-block text-start font-mono">
            <div title="Amino acid sequence">
              {/* use non breaking whitespace to prevent layout shifts */}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            {<ResidueHeaderItem variant="act" label="Binding site" />}
          </div>
        </div>
        {chunks.map((chunk, cindex) => (
          <div key={cindex}>
            <p
              className="text-[0.5rem] text-muted-foreground"
              title={chunk[0].resno.toString()}
            >
              {chunk[0].resno}
            </p>
            <div
              onMouseLeave={() => onHover(undefined)}
              className="flex flex-row"
            >
              {chunk.map((r, index) => (
                <ResidueCheckbox
                  key={r.resno}
                  resno={r.resno}
                  resname={r.resname}
                  seq={r.seq}
                  highlight={highlight === r.resno}
                  activeChecked={selected.act.includes(r.resno)}
                  activeDisabled={!surface.includes(r.resno)}
                  passiveChecked={false}
                  passiveDisabled={true}
                  onHover={() => onHover(r.resno)}
                  onActiveChange={(e) =>
                    handleChange(e, cindex * chunkSize + index, "act")
                  }
                  onPassiveChange={() => {}}
                  showActive={true}
                  showPassive={false}
                  neighbourChecked={false}
                  theme={theme === null ? "light" : theme}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <FormDescription>
        (Hold Shift to select a range of residues. Click residue in 3D viewer to
        select.)
      </FormDescription>
      <div className="flex flex-row items-center gap-2">
        Binding site
        <ImportResidues selected={selected.act} onChange={onActiveImport} />
      </div>
    </>
  );
}

function BindingResiduesSubForm({
  actpass,
  molecule,
  onActPassChange,
  setSurfaceResidues,
}: ResidueSubFormProps) {
  const {
    resetShowBuriedToggle,
    surfaceOrBuriedResidues,
    surfaceBuriedTogglesProps,
  } = useShowSurfaceBuriedToggles({
    surfaceResidues: molecule.surfaceResidues,
    residues: molecule.residues.map((r) => r.resno),
  });
  const [theme] = useTheme();
  const [renderSelectionAs, setRenderSelectionAs] =
    useState<StructureRepresentationType>(
      molecule.residues.length > BIG_MOLECULE ? "surface" : "spacefill",
    );
  const [busy, setBusy] = useState(false);
  const safeFile = useSafeFile(molecule.file);
  const [surfaceCutoff, setSurfaceCutoff] = useSurfaceCutoff({
    setBusy,
    setSurfaceResidues,
    safeFile,
    targetChain: molecule.targetChain,
  });
  const [hoveredFrom2DResidue, setHoveredFrom2DResidue] = useState<
    number | undefined
  >();
  const [hoveredFrom3DResidue, setHoveredFrom3DResidue] = useState<
    number | undefined
  >();

  useEffect(() => {
    // If only one residue is present, select it
    if (molecule.residues.length === 1) {
      onActPassChange?.({
        active: [molecule.residues[0].resno],
        passive: [],
        neighbours: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    }
  }, [
    actpass.bodyRestraints,
    molecule.residues,
    molecule.targetChain,
    onActPassChange,
  ]);

  async function handle2DResidueChange(newSelection: ResidueSelection) {
    if (!onActPassChange || !safeFile) {
      return;
    }
    setBusy(true);
    try {
      onActPassChange({
        active: newSelection.act,
        passive: [],
        neighbours: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    } finally {
      setBusy(false);
    }
  }

  function handle3DResiduePick(chain: string, resno: number) {
    if (
      molecule.targetChain !== chain ||
      !molecule.surfaceResidues.includes(resno)
    ) {
      return;
    }
    const newSelection = toggleResidue(resno, "act", {
      act: actpass.active,
      pass: actpass.passive,
    });
    handle2DResidueChange(newSelection);
  }

  function onRenderSelectionAsChange(value: StructureRepresentationType) {
    setRenderSelectionAs(value);
    resetShowBuriedToggle(value === "surface");
  }

  return (
    <>
      <div className="h-[500px] w-full">
        <Viewer
          structure={molecule.file}
          chain={molecule.targetChain}
          active={actpass.active}
          passive={actpass.passive}
          renderSelectionAs={renderSelectionAs}
          surface={surfaceOrBuriedResidues}
          neighbours={[]}
          onPick={handle3DResiduePick}
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
          onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
          theme={theme === null ? undefined : theme}
        />
      </div>
      <Label>Select ligand binding site residues</Label>
      <BindingResiduesSelect
        options={molecule.residues}
        onChange={handle2DResidueChange}
        selected={{
          act: actpass.active,
          pass: actpass.passive,
          neighbours: actpass.neighbours,
        }}
        onHover={setHoveredFrom2DResidue}
        highlight={hoveredFrom3DResidue}
      />
      {renderSelectionAs !== "surface" && (
        <ShowSurfaceBuriedToggles {...surfaceBuriedTogglesProps} />
      )}
      <div className="flex gap-2">
        <MoleculeSettings
          surfaceCutoff={surfaceCutoff}
          setSurfaceCutoff={setSurfaceCutoff}
          renderSelectionAs={renderSelectionAs}
          onRenderSelectionAsChange={onRenderSelectionAsChange}
        />
        <Spinner title="Performing computation on server" show={busy} />
      </div>
    </>
  );
}

export function BindingMoleculeSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
  targetChain,
  preprocessPipeline = "",
  accessibilityCutoff = 0.15,
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
  preprocessPipeline?: PreprocessPipeline;
  accessibilityCutoff?: number;
}) {
  return (
    <AtomStructureSubForm
      name={name}
      legend={legend}
      description={description}
      actpass={actpass}
      onActPassChange={onActPassChange}
      targetChain={targetChain}
      preprocessPipeline={preprocessPipeline}
      accessibilityCutoff={accessibilityCutoff}
      ResiduesSubForm={BindingResiduesSubForm}
    />
  );
}
