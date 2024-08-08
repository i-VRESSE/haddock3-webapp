import { StructureRepresentationType } from "ngl";
import { useState, useEffect, ReactNode } from "react";

import {
  ResiduesSelect,
  ResidueSelection,
  ActPass,
  PickIn3D,
  CopyButton,
} from "./ResiduesSelect";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PreprocessPipeline } from "./restraints";
import {
  RestraintsFlavour,
  RestraintsFlavourPicker,
} from "./RestraintsFlavourPicker";
import { LabeledCheckbox } from "./LabeledCheckbox";
import {
  ShowSurfaceBuriedToggles,
  useShowSurfaceBuriedToggles,
} from "./ShowSurfaceBuriedToggles";
import { MoleculeSettings } from "./MoleculeSettings";
import { Spinner } from "~/components/ui/spinner";
import { ActPassSelection } from "./ActPassSelection";
import {
  AtomStructureSubForm,
  Molecule,
  ResidueSubFormProps,
} from "./AtomStructureSubForm.client";
import { toggleResidue } from "./toggleResidue";
import { BIG_MOLECULE } from "./constants";
import { useSurfaceCutoff } from "./useSurfaceCutoff";
import { computeNeighbours, useNeighbourRadius } from "./useNeighbourRadius";
import { useSafeFile } from "./useSafeFile";
import { useTheme } from "remix-themes";
import { Viewer } from "@i-vresse/haddock3-ui";

export function ResiduesSubForm({
  molecule,
  actpass,
  restraintsFlavour,
  onActPassChange,
  disabled,
  children,
  setSurfaceResidues,
  label = "Residues",
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  restraintsFlavour: RestraintsFlavour;
  onActPassChange?: (actpass: ActPassSelection) => void;
  label?: string;
  disabled: boolean;
  setSurfaceResidues: (surfaceResidues: number[]) => void;
  children?: ReactNode;
}) {
  const [theme] = useTheme();
  const [showNeighbours, setShowNeigbours] = useState(false);
  const [busy, setBusy] = useState(false);
  const {
    resetShowBuriedToggle,
    surfaceOrBuriedResidues,
    surfaceBuriedTogglesProps,
  } = useShowSurfaceBuriedToggles({
    surfaceResidues: molecule.surfaceResidues,
    residues: molecule.residues.map((r) => r.resno),
  });
  const [renderSelectionAs, setRenderSelectionAs] =
    useState<StructureRepresentationType>(
      molecule.residues.length > BIG_MOLECULE ? "surface" : "spacefill",
    );
  const safeFile = useSafeFile(molecule.file);
  const [surfaceCutoff, setSurfaceCutoff] = useSurfaceCutoff({
    setBusy,
    setSurfaceResidues,
    safeFile,
    targetChain: molecule.targetChain,
  });
  const [neighourRadius, setNeighourRadius] = useNeighbourRadius({
    setBusy,
    actpass,
    safeFile,
    molecule,
    restraintsFlavour,
    onActPassChange,
  });
  const [hoveredFrom2DResidue, setHoveredFrom2DResidue] = useState<
    number | undefined
  >();
  const [hoveredFrom3DResidue, setHoveredFrom3DResidue] = useState<
    number | undefined
  >();
  const [picker3D, setPicker3D] = useState<ActPass>("act");

  useEffect(() => {
    setShowNeigbours(false);
    if (restraintsFlavour.kind === "pass") {
      setPicker3D("pass");
    }
    if (["act", "actpass"].includes(restraintsFlavour.kind)) {
      setPicker3D("act");
    }
  }, [restraintsFlavour, setPicker3D, setShowNeigbours]);

  useEffect(() => {
    // If only one residue is present, select it
    if (molecule.residues.length === 1) {
      const active = ["act", "actpass"].includes(restraintsFlavour.kind)
        ? [molecule.residues[0].resno]
        : [];
      const passive = ["surf", "pass"].includes(restraintsFlavour.kind)
        ? [molecule.residues[0].resno]
        : [];
      onActPassChange?.({
        active,
        passive,
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
    restraintsFlavour.kind,
  ]);

  async function handle2DResidueChange(newSelection: ResidueSelection) {
    if (!onActPassChange || !safeFile) {
      return;
    }
    setBusy(true);
    try {
      const neighbours = await computeNeighbours({
        structure: safeFile,
        chain: molecule.targetChain,
        surface: molecule.surfaceResidues,
        active: newSelection.act,
        passive: newSelection.pass,
        restraintsFlavour,
        radius: neighourRadius,
      });
      onActPassChange({
        active: newSelection.act,
        passive: newSelection.pass,
        neighbours,
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
    const newSelection = toggleResidue(resno, picker3D, actpass);
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
          neighbours={showNeighbours ? actpass.neighbours : []}
          onPick={
            restraintsFlavour.kind === "surf" ? undefined : handle3DResiduePick
          }
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
          onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
          theme={theme === null ? undefined : theme}
        />
      </div>
      {children}
      <Label>{label}</Label>
      <ResiduesSelect
        options={molecule.residues}
        onChange={handle2DResidueChange}
        disabledPassive={disabled || restraintsFlavour.kind === "act"}
        disabledActive={disabled}
        showActive={["act", "actpass"].includes(restraintsFlavour.kind)}
        showPassive={["pass", "actpass", "surf"].includes(
          restraintsFlavour.kind,
        )}
        showNeighbours={showNeighbours}
        selected={{
          act: actpass.active,
          pass: actpass.passive,
          neighbours: actpass.neighbours,
        }}
        onHover={setHoveredFrom2DResidue}
        highlight={hoveredFrom3DResidue}
      />
      <div className="">
        {(restraintsFlavour.activeNeighbours ||
          restraintsFlavour.passiveNeighbours) &&
          restraintsFlavour.kind !== "surf" && (
            <LabeledCheckbox value={showNeighbours} onChange={setShowNeigbours}>
              Show computed passive neighbours
            </LabeledCheckbox>
          )}
        {showNeighbours && (
          <div className="flex items-center gap-1">
            <Input
              readOnly
              value={actpass.neighbours.join(",")}
              className="w-32 p-1"
            />
            <CopyButton content={actpass.neighbours.join(",")} />
          </div>
        )}
        {restraintsFlavour.kind === "actpass" && (
          <PickIn3D value={picker3D} onChange={setPicker3D} />
        )}
        {restraintsFlavour.kind !== "surf" &&
          renderSelectionAs !== "surface" && (
            <ShowSurfaceBuriedToggles {...surfaceBuriedTogglesProps} />
          )}
        <div className="flex gap-2">
          <MoleculeSettings
            surfaceCutoff={surfaceCutoff}
            setSurfaceCutoff={setSurfaceCutoff}
            neighourRadius={neighourRadius}
            setNeighourRadius={setNeighourRadius}
            renderSelectionAs={renderSelectionAs}
            onRenderSelectionAsChange={onRenderSelectionAsChange}
          />
          <Spinner title="Performing computation on server" show={busy} />
        </div>
      </div>
    </>
  );
}

function ResiduesSubFormWrapper({
  molecule,
  actpass,
  onActPassChange,
  setSurfaceResidues,
}: ResidueSubFormProps) {
  const [restraintsFlavour, setrestraintsFlavour] = useState<RestraintsFlavour>(
    {
      kind: "act",
      activeNeighbours: true,
      passiveNeighbours: false,
    },
  );

  function onRestraintsFlavourChange(restraintsFlavour: RestraintsFlavour) {
    setrestraintsFlavour(restraintsFlavour);
    if (restraintsFlavour.kind === "surf") {
      onActPassChange({
        active: [],
        passive: molecule.surfaceResidues,
        neighbours: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    } else {
      onActPassChange({
        active: [],
        passive: [],
        neighbours: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    }
  }

  const disabled = restraintsFlavour.kind === "surf";

  return (
    <>
      <RestraintsFlavourPicker
        value={restraintsFlavour}
        onChange={onRestraintsFlavourChange}
      />
      <ResiduesSubForm
        actpass={actpass}
        molecule={molecule}
        disabled={disabled}
        onActPassChange={onActPassChange}
        restraintsFlavour={restraintsFlavour}
        setSurfaceResidues={setSurfaceResidues}
      ></ResiduesSubForm>
    </>
  );
}

export function MacroMoleculeSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
  targetChain,
  preprocessPipeline = "",
  accessibilityCutoff = 0.4,
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
      ResiduesSubForm={ResiduesSubFormWrapper}
    />
  );
}
