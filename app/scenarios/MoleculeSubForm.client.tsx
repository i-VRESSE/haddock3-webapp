import { Structure, StructureRepresentationType, autoLoad } from "ngl";
import { useState, useEffect, ReactNode } from "react";
import { useTheme } from "remix-themes";

import { FormDescription } from "./FormDescription";
import { FormItem } from "./FormItem";
import { ChainSelect } from "./ChainSelect";
import { ChainRadioGroup } from "./ChainRadioGroup";
import {
  ResiduesSelect,
  ResidueSelection,
  ActPass,
  PickIn3D,
  CopyButton,
} from "./ResiduesSelect";
import { Residue, chainsFromStructure } from "./molecule.client";
import { SimpleViewer, Viewer } from "./Viewer.client";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  RestraintsErrors,
  PreprocessPipeline,
  calclulateRestraints,
  jsonSafeFile,
  passiveFromActive,
  calculateAccessibility,
} from "./restraints";
import {
  RestraintsFlavour,
  RestraintsFlavourPicker,
} from "./RestraintsFlavourPicker";
import { LabeledCheckbox } from "./LabeledCheckbox";
import { ShowSurfaceBuriedToggles } from "./ShowSurfaceBuriedToggles";
import { HiddenFileInput } from "./HiddenFileInput";
import { LinkToFile } from "./LinkToFile";
import { MoleculeSettings } from "./MoleculeSettings";
import { Spinner } from "~/components/ui/spinner";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";

export type ActPassSelection = {
  active: number[];
  passive: number[];
  neighbours: number[];
  chain: string;
  bodyRestraints: string;
};

export function MoleculeSubFormWrapper({
  legend,
  description,
  children,
}: {
  legend: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-solid border-primary p-3">
      <legend>{legend}</legend>
      <FormDescription>{description}</FormDescription>
      {children}
    </fieldset>
  );
}

export function UserStructure({
  name,
  onChange,
}: {
  name: string;
  onChange: (file: File, chain: string, chains: string[]) => void;
}) {
  const [chains, setChains] = useState<string[]>([]);
  const [file, setFile] = useState<File | undefined>();

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const structure: Structure = await autoLoad(file);
    const chains: string[] = [];
    structure.eachChain((c) => {
      // Same chain can be before+after TER line
      // See https://github.com/haddocking/haddock3/blob/main/examples/data/1a2k_r_u.pdb
      // to prevent 2 chains called A,A skip second
      if (chains.includes(c.chainname)) {
        return;
      }
      chains.push(c.chainname);
    });
    setChains(chains);
    setFile(file);
    if (chains.length === 1) {
      onChange(file, chains[0], chains);
    }
  }

  function onChainSelect(chain: string) {
    if (file) {
      onChange(file, chain, chains);
    }
  }

  const myname = name + "-user";
  return (
    <>
      <FormItem name={myname} label="Structure">
        <Input
          type="file"
          id={myname}
          name={myname}
          required={true}
          accept=".pdb"
          onChange={onFileChange}
        />
        <div className="h-[500px] w-full">
          {file && <SimpleViewer structure={file} />}
        </div>
      </FormItem>
      <FormItem name={`${name}-chain`} label="Chain">
        {file ? (
          <ChainRadioGroup
            chains={chains}
            onSelect={onChainSelect}
            selected=""
          />
        ) : (
          <p>Load a structure first</p>
        )}
      </FormItem>
    </>
  );
}

export interface Molecule {
  userFile: File;
  userChains: string[];
  userSelectedChain: string;
  file: File;
  targetChain: string;
  residues: Residue[];
  surfaceResidues: number[];
  errors?: RestraintsErrors;
}

export function ProcessedStructure({
  molecule,
  bodyRestraints,
  onChainChange,
  onRefreshStructure,
}: {
  molecule: Molecule;
  bodyRestraints: string;
  onChainChange: (chain: string) => void;
  onRefreshStructure: () => void;
}) {
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
  return (
    <>
      <div>
        <div className="flex items-center">
          User uploaded structure:{" "}
          <LinkToFile file={molecule.userFile}>
            {molecule.userFile.name}
          </LinkToFile>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRefreshStructure();
            }}
            title="Upload another structure"
            variant="ghost"
            size="icon"
          >
            <RefreshCw />
          </Button>
        </div>
        <div>
          Selected chain{" "}
          <ChainSelect
            chains={molecule.userChains}
            onSelect={onChainChange}
            selected={molecule.userSelectedChain}
          ></ChainSelect>{" "}
          has been filtered{" "}
          {molecule.userSelectedChain !== molecule.targetChain && (
            <span>
              and renamed to <b>{molecule.targetChain}</b>
            </span>
          )}{" "}
          during processing.
        </div>
        <div>
          Processed structure:{" "}
          <LinkToFile file={molecule.file}>{molecule.file.name}</LinkToFile>
        </div>
        <div>
          {bodyRestraints && (
            <details>
              <summary>Body restraints</summary>
              <pre className="overflow-auto" style={style}>
                {bodyRestraints}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}

async function computeNeighbours({
  structure,
  chain,
  surface,
  active,
  passive,
  restraintsFlavour,
  radius,
}: {
  structure: string;
  chain: string;
  surface: number[];
  active: number[];
  passive: number[];
  restraintsFlavour: RestraintsFlavour;
  radius: number;
}): Promise<number[]> {
  if (
    !restraintsFlavour.activeNeighbours &&
    !restraintsFlavour.passiveNeighbours
  ) {
    return [];
  }
  let derivedActive: number[] = [];
  if (restraintsFlavour.activeNeighbours) {
    derivedActive = active;
  }
  if (restraintsFlavour.passiveNeighbours) {
    derivedActive = derivedActive.concat(passive);
  }
  return passiveFromActive(structure, chain, derivedActive, surface, radius);
}

function toggleResidue(
  resno: number,
  pick: ActPass,
  current: ActPassSelection,
) {
  const newSelection = {
    act: current.active,
    pass: current.passive,
  };
  if (pick === "act") {
    if (newSelection.act.includes(resno)) {
      newSelection.act = newSelection.act.filter((r) => r !== resno);
    } else {
      newSelection.act = [...newSelection.act, resno];
      newSelection.pass = current.passive.filter(
        (r) => !newSelection.act.includes(r),
      );
    }
  } else {
    if (newSelection.pass.includes(resno)) {
      newSelection.pass = newSelection.pass.filter((r) => r !== resno);
    } else {
      newSelection.pass = [...newSelection.pass, resno];
      newSelection.act = current.active.filter(
        (r) => !newSelection.pass.includes(r),
      );
    }
  }
  return newSelection;
}

// TODO only render big proteins as surfaces other molecules as spacefill
// current workaround is to molecule has more than 50 residues, render as surface
const BIG_MOLECULE = 50;

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
  const [showNeighbours, setShowNeigbours] = useState(false);
  const [surfaceCutoff, setSurfaceCutoff] = useState(0.15);
  const [neighourRadius, setNeighourRadius] = useState(6.5);
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
  const [picker3D, setPicker3D] = useState<ActPass>("act");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchSafeFile = async () => {
      const result = await jsonSafeFile(molecule.file);
      setSafeFile(result);
    };
    fetchSafeFile();
  }, [molecule.file]);

  useEffect(() => {
    setShowNeigbours(false);
    if (restraintsFlavour.kind === "pass") {
      setPicker3D("pass");
    }
    if (["act", "actpass"].includes(restraintsFlavour.kind)) {
      setPicker3D("act");
    }
  }, [restraintsFlavour, setPicker3D, setShowNeigbours]);

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

  async function onNeighourRadiusChange(radius: number) {
    if (!onActPassChange || !safeFile) {
      return;
    }
    setBusy(true);
    try {
      const neighbours = await computeNeighbours({
        structure: safeFile,
        chain: molecule.targetChain,
        surface: molecule.surfaceResidues,
        active: actpass.active,
        passive: actpass.passive,
        restraintsFlavour,
        radius: neighourRadius,
      });
      onActPassChange({
        ...actpass,
        neighbours,
      });
      setNeighourRadius(radius);
    } finally {
      setBusy(false);
    }
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
          neighbours={showNeighbours ? actpass.neighbours : []}
          onPick={
            restraintsFlavour.kind === "surf" ? undefined : handle3DResiduePick
          }
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
          onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
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
        <div className="flex flex-row gap-4 py-2">
          {restraintsFlavour.kind !== "surf" &&
            renderSelectionAs !== "surface" && (
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
            neighourRadius={neighourRadius}
            setNeighourRadius={onNeighourRadiusChange}
            renderSelectionAs={renderSelectionAs}
            onRenderSelectionAsChange={onRenderSelectionAsChange}
          />
          <Spinner title="Performing computation on server" show={busy} />
        </div>
      </div>
    </>
  );
}

export function RestraintsErrorsReport({
  errors,
}: {
  errors: Molecule["errors"];
}) {
  if (!errors) {
    return null;
  }
  return (
    <div className="text-destructive">
      {errors.accessibility && (
        <>
          <div>Error calculating accessibility:</div>
          <div>{errors.accessibility}</div>
        </>
      )}
      <span>Please fix the PDB file, re-upload and select chain again.</span>
    </div>
  );
}

function ResiduesSubFormWrapper({
  molecule,
  actpass,
  onActPassChange,
  targetChain,
  setSurfaceResidues,
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
  setSurfaceResidues: (surfaceResidues: number[]) => void;
}) {
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
        chain: targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    } else {
      onActPassChange({
        active: [],
        passive: [],
        neighbours: [],
        chain: targetChain,
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

export function MoleculeSubForm({
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
            <ResiduesSubFormWrapper
              molecule={molecule}
              actpass={actpass}
              onActPassChange={onActPassChange}
              targetChain={targetChain}
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
