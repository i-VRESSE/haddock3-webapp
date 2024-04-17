import { Structure, autoLoad } from "ngl";
import { useState, useEffect, ReactNode, useRef } from "react";

import { useTheme } from "remix-themes";

import { FormDescription } from "./FormDescription";
import { FormItem } from "./FormItem";
import { ChainSelect } from "./ChainSelect";
import { ResiduesSelect } from "./ResiduesSelect";
import { Residue, chainsFromStructure } from "./molecule.client";
import { Viewer } from "./Viewer.client";

import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  RestraintsErrors,
  PreprocessPipeline,
  calclulateRestraints,
  jsonSafeFile,
  passiveFromActive,
} from "./restraints";

export type ActPassSelection = {
  active: number[];
  passive: number[];
  chain: string;
  bodyRestraints: string;
};

function filterOutBuriedResidues(
  residues: number[],
  surfaceResidues: number[],
) {
  return residues.filter((resno) => surfaceResidues.includes(resno));
}

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
      <FormItem name={name} label="Structure">
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

export function ResiduesSubForm({
  molecule,
  actpass,
  onActPassChange,
  label = "Active residues",
  children,
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  label?: string;
  children?: ReactNode;
}) {
  const [showPassive, setShowPassive] = useState(false);
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

  useEffect(() => {
    const fetchSafeFile = async () => {
      const result = await jsonSafeFile(molecule.file);
      setSafeFile(result);
    };
    fetchSafeFile();
  }, [molecule.file]);

  async function handleActiveResiduesChange(activeResidues: number[]) {
    if (!molecule) {
      return;
    }
    const activeSelection = filterOutBuriedResidues(
      activeResidues,
      molecule.surfaceResidues,
    );
    try {
      const structure =
        safeFile === undefined ? await jsonSafeFile(molecule.file) : safeFile;
      const passiveResidues = await passiveFromActive(
        structure,
        molecule.targetChain,
        activeSelection,
        molecule.surfaceResidues,
      );
      onActPassChange({
        active: activeResidues,
        passive: passiveResidues,
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
    } catch (error) {
      onActPassChange({
        active: activeResidues,
        passive: [],
        chain: molecule.targetChain,
        bodyRestraints: actpass.bodyRestraints,
      });
      console.log(error);
      // TODO show error to user
    }
  }

  function onActiveResiduePick(chain: string, resno: number) {
    if (
      molecule.targetChain !== chain ||
      !molecule.surfaceResidues.includes(resno)
    ) {
      return;
    }
    const activeResidues = actpass.active;
    const index = activeResidues.indexOf(resno);
    if (index === -1) {
      handleActiveResiduesChange([...activeResidues, resno]);
    } else {
      handleActiveResiduesChange([
        ...activeResidues.slice(0, index),
        ...activeResidues.slice(index + 1),
      ]);
    }
  }

  return (
    <>
      <div className="h-[500px] w-full">
        <Viewer
          structure={molecule.file}
          chain={molecule.targetChain}
          active={actpass.active}
          passive={showPassive ? actpass.passive : []}
          surface={showSurface ? molecule.surfaceResidues : []}
          activePickable
          onActivePick={onActiveResiduePick}
          higlightResidue={hoveredFrom2DResidue}
          onHover={(_, residue) => setHoveredFrom3DResidue(residue)}
        />
      </div>
      {children}
      <Label>{label}</Label>
      <ResiduesSelect
        options={molecule.residues || []}
        selected={actpass.active}
        onChange={handleActiveResiduesChange}
        surface={molecule.surfaceResidues}
        onHover={setHoveredFrom2DResidue}
        highlight={hoveredFrom3DResidue}
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showpassive"
          defaultChecked={showPassive}
          onCheckedChange={() => setShowPassive(!showPassive)}
        />
        <label htmlFor="showpassive">Show computed passive restraints</label>
        <Checkbox
          id="showsurface"
          defaultChecked={showSurface}
          onCheckedChange={() => setShowSurface(!showSurface)}
        />
        <label htmlFor="showsurface">Show surface residues</label>
        {/* TODO show none/surface/buried radio group */}
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
            <ResiduesSubForm
              actpass={actpass}
              molecule={molecule}
              onActPassChange={onActPassChange}
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
