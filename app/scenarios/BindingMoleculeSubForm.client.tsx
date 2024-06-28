import { Structure, StructureRepresentationType, autoLoad } from "ngl";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ActPassSelection } from "./ActPassSelection";
import { HiddenFileInput } from "./HiddenFileInput";
import {
  BIG_MOLECULE,
  Molecule,
  MoleculeSubFormWrapper,
  ProcessedStructure,
  RestraintsErrorsReport,
  UserStructure,
  toggleResidue,
} from "./MoleculeSubForm.client";
import { Residue, chainsFromStructure } from "./molecule.client";
import {
  PreprocessPipeline,
  calclulateRestraints,
  calculateAccessibility,
  jsonSafeFile,
} from "./restraints";
import { Label } from "~/components/ui/label";
import { Viewer } from "./Viewer.client";
import { Spinner } from "~/components/ui/spinner";
import { MoleculeSettings } from "./MoleculeSettings";
import { FormDescription } from "./FormDescription";
import {
  ActPass,
  ImportResidues,
  ResidueCheckbox,
  ResidueHeaderItem,
  ResidueNeighbourSelection,
  ResidueSelection,
} from "./ResiduesSelect";
import { ShowSurfaceBuriedToggles } from "./ShowSurfaceBuriedToggles";

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
  const surface = useMemo(
    () => options.filter((r) => r.surface).map((r) => r.resno),
    [options],
  );
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    actpass: ActPass,
  ) {
    const residue = parseInt(e.target.value);
    const ne = e.nativeEvent as KeyboardEvent;
    let newSelected: number[] = [];
    if (ne.shiftKey && lastChecked !== null) {
      const start = Math.min(lastChecked, index);
      const end = Math.max(lastChecked, index);
      newSelected = [...selected[actpass]];
      for (let i = start; i <= end; i++) {
        const resno = options[i].resno;
        if (!newSelected.includes(resno) && surface.includes(resno)) {
          newSelected.push(resno);
        }
      }
    } else {
      if (e.target.checked) {
        newSelected = [...selected[actpass], residue];
      } else {
        newSelected = selected[actpass].filter((r) => r !== residue);
      }
    }
    if (actpass === "act") {
      // Active should take precedence over passive.
      // For example given passive is selected,
      // then selecting same residue as active should remove it from passive.
      const passiveWithoutAlsoActive = selected.pass.filter(
        (r) => !newSelected.includes(r),
      );
      onChange({
        act: newSelected,
        pass: passiveWithoutAlsoActive,
      });
    } else {
      onChange({
        pass: newSelected,
        act: selected.act,
      });
    }

    if (e.target.checked) {
      setLastChecked(index);
    }
  }

  function onActiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      act: filtered,
      pass: selected.pass,
    });
  }

  const chunkSize = 10;
  const initialArray: Residue[][] = [];
  const chunks = options.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, initialArray);

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <div>
          <p className="text-[0.5rem]">&nbsp;</p>
          <div className="inline-block text-start font-mono">
            <div title="Amino aced sequence">
              {/* use non breaking whitespace to prevent layout shifts */}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            {<ResidueHeaderItem variant="act" label="Binding" />}
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
            <div onMouseLeave={() => onHover(undefined)}>
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
}: {
  actpass: ActPassSelection;
  molecule: Molecule;
  onActPassChange: (actpass: ActPassSelection) => void;
  setSurfaceResidues: (surfaceResidues: number[]) => void;
}) {
  const [surfaceCutoff, setSurfaceCutoff] = useState(0.15);
  const [showSurface, setShowSurface] = useState(false);
  const [showBuried, setShowBuried] = useState(false);
  const [renderSelectionAs, setRenderSelectionAs] =
    useState<StructureRepresentationType>(
      molecule.residues.length > BIG_MOLECULE ? "surface" : "spacefill",
    );
  // gzipping and base64 encoding file can be slow, so we cache it
  // for example 8qg1 of 1.7Mb took 208ms
  const [safeFile, setSafeFile] = useState<string | undefined>(undefined);
  const [hoveredFrom2DResidue, setHoveredFrom2DResidue] = useState<
    number | undefined
  >();
  const [hoveredFrom3DResidue, setHoveredFrom3DResidue] = useState<
    number | undefined
  >();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchSafeFile = async () => {
      const result = await jsonSafeFile(molecule.file);
      setSafeFile(result);
    };
    fetchSafeFile();
  }, [molecule.file]);

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
    const newSelection = toggleResidue(resno, "act", actpass);
    handle2DResidueChange(newSelection);
  }

  async function onSurfaceCutoffChange(cutoff: number) {
    if (!safeFile) {
      return;
    }
    setBusy(true);
    try {
      const surfaceResidues = await calculateAccessibility(safeFile, cutoff);
      setSurfaceResidues(surfaceResidues[0][molecule.targetChain] || []);
    } finally {
      setBusy(false);
    }
    setSurfaceCutoff(cutoff);
  }

  function onRenderSelectionAsChange(value: StructureRepresentationType) {
    setRenderSelectionAs(value);
    if (value === "surface") {
      setShowBuried(false);
      setShowSurface(true);
    } else {
      setShowSurface(false);
      setShowBuried(false);
    }
  }

  let surfaceOrBuriedResidues: number[] = [];
  if (showSurface) {
    surfaceOrBuriedResidues = molecule.surfaceResidues;
  } else if (showBuried) {
    surfaceOrBuriedResidues = molecule.residues
      .filter((residue) => !molecule.surfaceResidues.includes(residue.resno))
      .map((residue) => residue.resno);
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
        />
      </div>
      <Label>Select residues involved in binding of the ligand.</Label>
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
      <div className="flex flex-row gap-4 py-2">
        {renderSelectionAs !== "surface" && (
          <ShowSurfaceBuriedToggles
            surface={showSurface}
            setSurface={setShowSurface}
            buried={showBuried}
            setBuried={setShowBuried}
          />
        )}
      </div>
      <div className="flex gap-2">
        <MoleculeSettings
          surfaceCutoff={surfaceCutoff}
          setSurfaceCutoff={onSurfaceCutoffChange}
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
  const [molecule, setMolecule] = useState<Molecule | undefined>();

  async function onUserStructureAndChainSelect(
    file: File,
    chain: string,
    chains: string[],
  ) {
    const restraints = await calclulateRestraints(
      file,
      chain,
      targetChain,
      preprocessPipeline,
      accessibilityCutoff,
    );
    const structure: Structure = await autoLoad(restraints.file);
    const residues = chainsFromStructure(structure)[targetChain];
    residues.forEach((residue) => {
      residue.surface = restraints.surfaceResidues.includes(residue.resno);
    });
    const newMolecule: Molecule = {
      userFile: file,
      userChains: chains,
      userSelectedChain: chain,
      targetChain,
      residues,
      file: restraints.file,
      surfaceResidues: restraints.surfaceResidues,
    };
    if (restraints.errors) {
      newMolecule.errors = restraints.errors;
    }
    setMolecule(newMolecule);
    const newSelection = {
      active: [],
      passive: [],
      neighbours: [],
      chain: targetChain,
      bodyRestraints: restraints.bodyRestraints,
    };
    onActPassChange(newSelection);
  }

  function setMoleculeSurfaceResidues(surfaceResidues: number[]) {
    if (molecule) {
      const residues = molecule.residues.map((residue) => {
        residue.surface = surfaceResidues.includes(residue.resno);
        return residue;
      });
      setMolecule({ ...molecule, residues, surfaceResidues });
    }
  }

  return (
    <MoleculeSubFormWrapper legend={legend} description={description}>
      {molecule ? (
        <>
          <HiddenFileInput name={name} file={molecule.file} />
          <ProcessedStructure
            molecule={molecule}
            bodyRestraints={actpass.bodyRestraints}
            onChainChange={(chain) =>
              onUserStructureAndChainSelect(
                molecule.userFile,
                chain,
                molecule.userChains,
              )
            }
            onRefreshStructure={() => setMolecule(undefined)}
          />
          {molecule.errors ? (
            <RestraintsErrorsReport errors={molecule.errors} />
          ) : (
            <BindingResiduesSubForm
              actpass={actpass}
              molecule={molecule}
              onActPassChange={onActPassChange}
              setSurfaceResidues={setMoleculeSurfaceResidues}
            />
          )}
        </>
      ) : (
        <>
          <UserStructure name={name} onChange={onUserStructureAndChainSelect} />
        </>
      )}
    </MoleculeSubFormWrapper>
  );
}
