import { Structure, autoLoad } from "ngl";
import { useState, useEffect, ReactNode, useRef } from "react";
import { useTheme } from "remix-themes";

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
} from "./restraints";
import { RestraintsBase, RestraintsBasePicker } from "./RestraintsBasePicker";
import { LabeledCheckbox } from "./LabeledCheckbox";

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
  restraintsBase,
}: {
  structure: string;
  chain: string;
  surface: number[];
  active: number[];
  passive: number[];
  restraintsBase: RestraintsBase;
}): Promise<number[]> {
  if (!restraintsBase.activeNeighbours && !restraintsBase.passiveNeighbours) {
    return [];
  }
  let derivedActive: number[] = [];
  if (restraintsBase.activeNeighbours) {
    derivedActive = active;
  }
  if (restraintsBase.passiveNeighbours) {
    derivedActive = derivedActive.concat(passive);
  }
  return passiveFromActive(structure, chain, derivedActive, surface);
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
  restraintsBase,
  onActPassChange,
  disabled,
  children,
  label = "Residues",
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  restraintsBase: RestraintsBase;
  onActPassChange?: (actpass: ActPassSelection) => void;
  label?: string;
  disabled: boolean;
  children?: ReactNode;
}) {
  const [showNeighbours, setShowNeigbours] = useState(false);
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
    if (restraintsBase.kind === "pass") {
      setPicker3D("pass");
    }
    if (restraintsBase.kind === "act") {
      setPicker3D("act");
    }
  }, [restraintsBase, setPicker3D]);

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
      restraintsBase,
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
          pickable={restraintsBase.kind !== "surf"}
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
        disabledPassive={disabled}
        disabledActive={disabled}
        showActive={["act", "actpass"].includes(restraintsBase.kind)}
        showPassive={["pass", "actpass", "surf"].includes(restraintsBase.kind)}
        selected={{
          act: actpass.active,
          pass: actpass.passive,
        }}
        onHover={setHoveredFrom2DResidue}
        highlight={hoveredFrom3DResidue}
      />
      <div className="">
        {(restraintsBase.activeNeighbours ||
          restraintsBase.passiveNeighbours) &&
          restraintsBase.kind !== "surf" && (
            <LabeledCheckbox value={showNeighbours} onChange={setShowNeigbours}>
              Show computed passive neighbours
            </LabeledCheckbox>
          )}
        {showNeighbours && (
          <div className="flex items-center gap-1">
            <Label>Computed neighbours</Label>
            <Input
              readOnly
              value={actpass.neighbours.join(",")}
              className="w-1/2 p-1"
            />
            <CopyButton content={actpass.neighbours.join(",")} />
          </div>
        )}
        {restraintsBase.kind === "actpass" && (
          <PickIn3D value={picker3D} onChange={setPicker3D} />
        )}
        {restraintsBase.kind !== "surf" && (
          <LabeledCheckbox value={showSurface} onChange={setShowSurface}>
            Show surface residues
          </LabeledCheckbox>
        )}
        {/* TODO show none/surface/buried radio group? */}
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
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
}) {
  const [restraintsBase, setrestraintsBase] = useState<RestraintsBase>({
    kind: "act",
    activeNeighbours: true,
    passiveNeighbours: false,
  });

  function onRestraintsBaseChange(restraintsBase: RestraintsBase) {
    setrestraintsBase(restraintsBase);
    if (restraintsBase.kind === "surf") {
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

  const disabled = restraintsBase.kind === "surf";

  return (
    <>
      <RestraintsBasePicker
        value={restraintsBase}
        onChange={onRestraintsBaseChange}
      />
      <ResiduesSubForm
        actpass={actpass}
        molecule={molecule}
        disabled={disabled}
        onActPassChange={onActPassChange}
        restraintsBase={restraintsBase}
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
