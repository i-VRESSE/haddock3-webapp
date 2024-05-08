import { Structure, autoLoad } from "ngl";
import { useState, useEffect, ReactNode, useRef } from "react";
import { useTheme } from "remix-themes";
import { SlidersHorizontal } from "lucide-react";

import { FormDescription } from "./FormDescription";
import { FormItem } from "./FormItem";
import { ChainSelect } from "./ChainSelect";
import {
  ResiduesSelect,
  ResidueSelection,
  ActPass,
  PickIn3D,
  CopyButton,
} from "./ResiduesSelect";
import { Residue, chainsFromStructure } from "./molecule.client";
import { Viewer } from "./Viewer.client";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

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
          {file && (
            <Viewer
              structure={file}
              chain={""}
              active={[]}
              passive={[]}
              surface={[]}
            />
          )}
        </div>
      </FormItem>
      <FormItem name={`${name}-chain`} label="Chain">
        {file ? (
          <ChainSelect chains={chains} onSelect={onChainSelect} selected="" />
        ) : (
          <p>Load a structure first</p>
        )}
      </FormItem>
    </>
  );
}

function LinkToFile({ file, children }: { file: File; children: ReactNode }) {
  const [url, setUrl] = useState("#");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <a href={url} className="underline" download={file.name}>
      {children}
    </a>
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
  // TODO dont store surface twice in surfaceResidues and residues[n].surface
  errors?: RestraintsErrors;
}

export function ProcessedStructure({
  molecule,
  bodyRestraints,
}: {
  molecule: Molecule;
  bodyRestraints: string;
}) {
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
  // TODO allow another pdb file to be chosen or a different chain to be selected
  return (
    <>
      <div>
        <div>
          User uploaded structure:{" "}
          <LinkToFile file={molecule.userFile}>
            {molecule.userFile.name}
          </LinkToFile>
        </div>
        <div>
          Selected chain <b>{molecule.userSelectedChain}</b> has been filtered{" "}
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

export function HiddenFileInput({ name, file }: { name: string; file: File }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      ref.current.files = dataTransfer.files;
    }
  }, [file]);

  return <input ref={ref} type="file" name={name} className="hidden" />;
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
    // TODO show user ws call is running
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
  }

  async function onSurfaceCutoffChange(cutoff: number) {
    if (!safeFile) {
      return;
    }
    // TODO show user ws call is running
    const surfaceResidues = await calculateAccessibility(safeFile, cutoff);
    setSurfaceResidues(surfaceResidues[0][molecule.targetChain] || []);
    setSurfaceCutoff(cutoff);
  }

  return (
    <>
      <div className="h-[500px] w-full">
        <Viewer
          structure={molecule.file}
          chain={molecule.targetChain}
          active={actpass.active}
          passive={actpass.passive}
          surface={showSurface ? molecule.surfaceResidues : []}
          neighbours={showNeighbours ? actpass.neighbours : []}
          pickable={restraintsFlavour.kind !== "surf"}
          onPick={handle3DResiduePick}
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
          onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
        />
      </div>
      {children}
      <Label>{label}</Label>
      {/* TODO show neigbours as passive, be carefull not to conflict with user selected passive residues */}
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
        {restraintsFlavour.kind !== "surf" && (
          <LabeledCheckbox value={showSurface} onChange={setShowSurface}>
            Show surface residues
          </LabeledCheckbox>
        )}
        <MoleculeSettings
          surfaceCutoff={surfaceCutoff}
          setSurfaceCutoff={onSurfaceCutoffChange}
          neighourRadius={neighourRadius}
          setNeighourRadius={onNeighourRadiusChange}
        />
        {/* TODO show none/surface/buried radio group? */}
      </div>
    </>
  );
}

function MoleculeSettings({
  surfaceCutoff,
  setSurfaceCutoff,
  neighourRadius,
  setNeighourRadius,
}: {
  surfaceCutoff: number;
  setSurfaceCutoff: (cutoff: number) => void;
  neighourRadius: number;
  setNeighourRadius: (radius: number) => void;
}) {
  const [cutoff, setcutoff] = useState(surfaceCutoff);
  const [radius, setradius] = useState(neighourRadius);
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };

  function onOpenChange(open: boolean) {
    if (!open) {
      if (cutoff !== surfaceCutoff) {
        setSurfaceCutoff(cutoff);
      }
      if (radius !== neighourRadius) {
        setNeighourRadius(radius);
      }
    }
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <SlidersHorizontal />
      </PopoverTrigger>
      <PopoverContent>
        <FormItem name="surface-cutoff" label="Surface cutoff">
          <Input
            type="number"
            step="0.01"
            min="0.0"
            max="10"
            value={cutoff}
            style={style}
            onChange={(e) => setcutoff(Number(e.target.value))}
          />
        </FormItem>
        <FormItem name="neighbour-radius" label="Neighbour radius">
          <Input
            type="number"
            step="0.1"
            min="0.0"
            max="1000"
            value={radius}
            style={style}
            onChange={(e) => setradius(Number(e.target.value))}
          />
        </FormItem>
        (Close popover to commit changes)
      </PopoverContent>
    </Popover>
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
