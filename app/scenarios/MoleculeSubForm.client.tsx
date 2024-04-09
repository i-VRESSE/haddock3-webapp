import { Structure, autoLoad } from "ngl";
import { useState, useEffect, ReactNode, useRef } from "react";
import { strFromU8, gzip } from "fflate";

import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { ChainSelect } from "~/scenarios/ChainSelect";
import { ResiduesSelect } from "~/scenarios/ResiduesSelect";
import { Residue, chainsFromStructure } from "./molecule.client";
import { Viewer } from "./Viewer.client";
import {
  HTTPValidationError,
  client,
} from "~/haddock3-restraints-client/client";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { useTheme } from "remix-themes";
import { Label } from "~/components/ui/label";

export type ResidueSelection = { chain: string; resno: number[] };
export type ActPassSelection = {
  active: ResidueSelection;
  passive: ResidueSelection;
  bodyRestraints: string;
};

export async function passiveFromActive(
  structure: string,
  activeResidues: ResidueSelection,
  surface: number[]
) {
  /*
  On CLI
  haddock3-restraints passive_from_active -c protein1activeResidues.chain protein1 protein1activeResidues.resno.join(',') >> protein1.actpass
*/
  const body = {
    structure,
    chain: activeResidues.chain,
    active: activeResidues.resno,
    surface,
  };
  const { data, error } = await client.POST("/passive_from_active", {
    body,
  });
  if (error) {
    console.error(error);
    throw new Error("Could not calculate passive restraints");
  }
  return data;
}

async function jsonSafeFile(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    gzip(data, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(btoa(strFromU8(data, true)));
    });
  });
}

function flattenErrorResponses(response: HTTPValidationError): string {
  if (response === undefined) {
    return "";
  }
  if (typeof response.detail === "string") {
    return response.detail;
  }
  if (response.detail) {
    return response.detail.reduce((acc, detail) => {
      return acc + detail.msg + "\n";
    }, "");
  }
  throw new Error("Could not flatten error response");
}

async function calculateAccessibility(
  structure: string
): Promise<[Record<string, number[]>, undefined | string]> {
  const body = {
    structure,
    cutoff: 0.4,
  };
  const { data, error } = await client.POST("/calc_accessibility", {
    body,
  });
  if (error) {
    console.error(error);
    return [{}, flattenErrorResponses(error)];
  }
  const residues = Object.fromEntries(
    Object.entries(data).map(([chain, residues]) => [
      chain,
      residues === undefined ? [] : residues,
    ])
  );
  return [residues, undefined];
}

async function preprocessPdb(file: File, fromChain: string, toChain: string) {
  const structure = await jsonSafeFile(file);
  const { error, data } = await client.POST("/preprocess_pdb", {
    body: {
      structure,
      from_chain: fromChain,
      to_chain: toChain,
    },
    parseAs: "text",
  });
  if (error) {
    console.error(error);
    throw new Error("Could not preprocess pdb");
  }
  return new File([data], `processed-${fromChain}2${toChain}-${file.name}`, {
    type: file.type,
  });
}

async function restrainBodies(structure: string) {
  const { error, data } = await client.POST("/restrain_bodies", {
    body: { structure, exclude: [] },
    parseAs: "text",
  });
  if (error) {
    console.error(error);
    throw new Error("Could not restrain bodies");
  }
  if (typeof data !== "string") {
    return "";
  }
  return data;
}

async function calclulateRestraints(
  file: File,
  userSelectedChain: string,
  targetChain: string
) {
  const processed = await preprocessPdb(file, userSelectedChain, targetChain);
  const safeProcessed = await jsonSafeFile(processed);
  const [surfaceResidues, error] = await calculateAccessibility(safeProcessed);
  const bodyRestraints = await restrainBodies(safeProcessed);
  let errors: Molecule["errors"] = undefined;
  if (error) {
    errors = { accessibility: error };
  }
  return {
    surfaceResidues: surfaceResidues[targetChain] ?? [],
    bodyRestraints,
    file: processed,
    errors,
  };
}

function filterOutBuriedResidues(
  residues: number[],
  surfaceResidues: number[]
) {
  return residues.filter((resno) => surfaceResidues.includes(resno));
}

function MoleculeSubFormWrapper({
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

function UserStructure({
  name,
  onChange,
}: {
  name: string;
  onChange: (file: File, chain: string, chains: string[]) => void;
}) {
  const [chains, setChains] = useState<string[]>([]);
  const [structure, setStructure] = useState<Structure | undefined>();
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
    setStructure(structure);
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
          {structure && (
            <Viewer
              structure={structure}
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
    <a href={url} className="underline">
      {children}
    </a>
  );
}

interface Molecule {
  userFile: File;
  userChains: string[];
  userSelectedChain: string;
  file: File;
  targetChain: string;
  residues: Residue[];
  surfaceResidues: number[];
  errors?: {
    accessibility?: string;
    passiveFromActive?: string;
  };
  structure: Structure;
}

function ProcessedStructure({
  molecule,
  bodyRestraints,
}: {
  molecule: Molecule;
  bodyRestraints: string;
}) {
  function onUserChainSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    console.log(event.target.value);
    // TODO implement
  }
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
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
          Selected chain
          <select
            defaultValue={molecule.userSelectedChain}
            className="rounded bg-inherit p-1 text-inherit"
            onChange={onUserChainSelect}
          >
            {molecule.userChains.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>{" "}
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

function HiddenFileInput({ name, file }: { name: string; file: File }) {
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

function ResiduesSubForm({
  molecule,
  actpass,
  onActPassChange,
}: {
  molecule: Molecule;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
}) {
  const [showPassive, setShowPassive] = useState(false);
  const [showSurface, setShowSurface] = useState(false);
  // gzipping and base64 encoding file can be slow, so we cache it
  // for example 8qg1 of 1.7Mb took 208ms
  const [safeFile, setSafeFile] = useState<string | undefined>(undefined);
  const [hoveredResidue, setHoveredResidue] = useState<number | undefined>();

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
    const activeSelection = {
      chain: actpass.active.chain,
      resno: filterOutBuriedResidues(activeResidues, molecule.surfaceResidues),
    };
    try {
      const structure =
        safeFile === undefined ? await jsonSafeFile(molecule.file) : safeFile;
      const passiveResidues = await passiveFromActive(
        structure,
        activeSelection,
        molecule.surfaceResidues
      );
      onActPassChange({
        active: { chain: actpass.active.chain, resno: activeResidues },
        passive: {
          chain: actpass.passive.chain,
          resno: passiveResidues,
        },
        bodyRestraints: actpass.bodyRestraints,
      });
    } catch (error) {
      onActPassChange({
        active: { chain: actpass.active.chain, resno: activeResidues },
        passive: { chain: actpass.passive.chain, resno: [] },
        bodyRestraints: actpass.bodyRestraints,
      });
      console.log(error);
      // TODO show error to user
    }
  }

  function onActiveResiduePick(chain: string, resno: number) {
    if (
      actpass.active.chain !== chain ||
      !molecule.surfaceResidues.includes(resno)
    ) {
      return;
    }
    const activeResidues = actpass.active.resno;
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
          structure={molecule.structure}
          chain={actpass.active.chain}
          active={actpass.active.resno}
          passive={showPassive ? actpass.passive.resno : []}
          surface={showSurface ? molecule.surfaceResidues : []}
          activePickable
          onActivePick={onActiveResiduePick}
          higlightResidue={hoveredResidue}
        />
      </div>
      <Label>Active residues</Label>
      <ResiduesSelect
        options={molecule.residues || []}
        selected={actpass.active.resno}
        onChange={handleActiveResiduesChange}
        surface={molecule.surfaceResidues}
        onHover={setHoveredResidue}
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

function RestraintsErrors({ errors }: { errors: Molecule["errors"] }) {
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
}: {
  name: string;
  legend: string;
  description: string;
  actpass: ActPassSelection;
  onActPassChange: (actpass: ActPassSelection) => void;
  targetChain: string;
}) {
  const [molecule, setMolecule] = useState<Molecule | undefined>();

  async function onUserStructureAndChainSelect(
    file: File,
    chain: string,
    chains: string[]
  ) {
    const restraints = await calclulateRestraints(file, chain, targetChain);

    const structure: Structure = await autoLoad(restraints.file);
    const residues = chainsFromStructure(structure)[targetChain];
    const newMolecule: Molecule = {
      userFile: file,
      userChains: chains,
      userSelectedChain: chain,
      targetChain,
      residues,
      structure,
      file: restraints.file,
      surfaceResidues: restraints.surfaceResidues,
    };
    if (restraints.errors) {
      newMolecule.errors = restraints.errors;
    }
    setMolecule(newMolecule);
    const newSelection = {
      active: { chain: targetChain, resno: [] },
      passive: { chain: targetChain, resno: [] },
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
            <RestraintsErrors errors={molecule.errors} />
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
