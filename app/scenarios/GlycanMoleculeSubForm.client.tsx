import { useState } from "react";
import { type StructureRepresentationType } from "ngl";
import { useChunked } from "@i-vresse/haddock3-ui/useChunked";
import { ResiduesHeader } from "@i-vresse/haddock3-ui/toggles/ResidueHeader";
import { Viewer } from "@i-vresse/haddock3-ui";
import {
  ActPass,
  FormDescription,
  Residue,
  ResidueCheckbox,
  ResidueSelection,
  useResidueChangeHandler,
} from "@i-vresse/haddock3-ui/toggles";
import { useTheme } from "remix-themes";

import { ActPassSelection } from "./ActPassSelection";
import {
  AtomStructureSubForm,
  ResidueSubFormProps,
} from "./AtomStructureSubForm.client";
import { PreprocessPipeline } from "./restraints";
import { LabeledRadioGroup } from "./LabeledRadioGroup";
import { toggleResidue } from "./toggleResidue";
import { ImportResidues, PickIn3D } from "./ResiduesSelect";
import { useSafeFile } from "./useSafeFile";
import { Spinner } from "~/components/ui/spinner";
import { MoleculeSettings } from "./MoleculeSettings";

type Kind = "pass" | "actpass";

export function GlycanResiduesSelect({
  kind,
  options,
  onChange,
  selected,
  onHover,
  highlight,
}: {
  kind: Kind;
  options: Residue[];
  onChange: (newSelection: ResidueSelection) => void;
  selected: ResidueSelection;
  onHover: (resno: number | undefined) => void;
  highlight?: number;
}) {
  const [theme] = useTheme();
  const handleChange = useResidueChangeHandler({
    options,
    selected,
    onChange,
  });
  const chunkSize = 10;
  const chunks = useChunked(options, chunkSize);

  function onActiveImport(imported: number[]) {
    onChange({
      act: imported,
      pass: selected.pass.filter((r) => !imported.includes(r)),
    });
  }
  function onPassiveImport(imported: number[]) {
    onChange({
      pass: imported,
      act: selected.act.filter((r) => !imported.includes(r)),
    });
  }

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <ResiduesHeader showActive={kind === "actpass"} showPassive={true} />
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
                  // TODO render resname as seq is always uninformative 'X'
                  seq={r.seq}
                  highlight={highlight === r.resno}
                  activeChecked={selected.act.includes(r.resno)}
                  passiveChecked={selected.pass.includes(r.resno)}
                  activeDisabled={false}
                  passiveDisabled={false}
                  onHover={() => onHover(r.resno)}
                  onActiveChange={(e) =>
                    handleChange(e, cindex * chunkSize + index, "act")
                  }
                  onPassiveChange={(e) =>
                    handleChange(e, cindex * chunkSize + index, "pass")
                  }
                  showActive={kind === "actpass"}
                  showPassive={true}
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
      <div className="flex flex-row gap-2">
        {kind === "actpass" && (
          <div>
            Active
            <ImportResidues selected={selected.act} onChange={onActiveImport} />
          </div>
        )}
        <div>
          Passive
          <ImportResidues selected={selected.pass} onChange={onPassiveImport} />
        </div>
      </div>
    </>
  );
}

function ResiduesSubForm({
  molecule,
  actpass,
  onActPassChange,
}: ResidueSubFormProps) {
  const [theme] = useTheme();
  const selectionOpacity = theme === "dark" ? 0.3 : 0.1;
  const [restraintsKind, setRestraintsKind] = useState<Kind>("pass");
  const [busy, setBusy] = useState(false);
  const safeFile = useSafeFile(molecule.file);
  const [renderSelectionAs, setRenderSelectionAs] =
    useState<StructureRepresentationType>("spacefill");
  const [hoveredFrom2DResidue, setHoveredFrom2DResidue] = useState<
    number | undefined
  >();
  const [hoveredFrom3DResidue, setHoveredFrom3DResidue] = useState<
    number | undefined
  >();
  const [picker3D, setPicker3D] = useState<ActPass>("pass");

  function onRestraintsKindChange(kind: Kind) {
    setRestraintsKind(kind);
    // Retain passive selection after switching kind
    onActPassChange({ ...actpass, active: [] });
    setPicker3D("pass");
  }

  async function handle2DResidueChange(newSelection: ResidueSelection) {
    if (!onActPassChange || !safeFile) {
      return;
    }
    setBusy(true);
    try {
      onActPassChange({
        active: newSelection.act,
        passive: newSelection.pass,
        neighbours: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    } finally {
      setBusy(false);
    }
  }

  function handle3DResiduePick(chain: string, resno: number) {
    if (molecule.targetChain !== chain) {
      return;
    }
    const newSelection = toggleResidue(resno, picker3D, actpass);
    handle2DResidueChange(newSelection);
  }

  return (
    <>
      <LabeledRadioGroup
        label="How would you like to select residues for restraints?"
        value={restraintsKind}
        choices={[
          ["pass", "Selected residues as passive"],
          ["actpass", "Select active and passive set of residues"],
        ]}
        onChange={onRestraintsKindChange}
      />
      <div className="h-[500px] w-full">
        <Viewer
          structure={molecule.file}
          chain={molecule.targetChain}
          active={actpass.active}
          passive={actpass.passive}
          renderSelectionAs={renderSelectionAs}
          surface={[]}
          neighbours={[]}
          onPick={handle3DResiduePick}
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
          onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
          selectionOpacity={selectionOpacity}
          theme={theme === null ? undefined : theme}
        />
      </div>
      <GlycanResiduesSelect
        kind={restraintsKind}
        options={molecule.residues}
        onChange={handle2DResidueChange}
        selected={{
          act: actpass.active,
          pass: actpass.passive,
        }}
        onHover={setHoveredFrom2DResidue}
        highlight={hoveredFrom3DResidue}
      />
      <div className="flex gap-2">
        {restraintsKind === "actpass" && (
          <PickIn3D value={picker3D} onChange={setPicker3D} />
        )}
        <MoleculeSettings
          renderSelectionAs={renderSelectionAs}
          onRenderSelectionAsChange={setRenderSelectionAs}
        />
        <Spinner title="Performing computation on server" show={busy} />
      </div>
    </>
  );
}

export function GlycanMoleculeSubForm({
  name,
  legend,
  description,
  actpass,
  onActPassChange,
  targetChain,
  preprocessPipeline = "",
  accessibilityCutoff = -1, // Disable surface calculation
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
      ResiduesSubForm={ResiduesSubForm}
      allSelect={"pass"}
    />
  );
}
