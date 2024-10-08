import { useId, useState } from "react";
import {
  HiddenFileInput,
  LigandViewer,
  LinkToFile,
} from "@i-vresse/haddock3-ui";
import {
  Hetero,
  heterosFromFile,
  hetGrepFile,
} from "@i-vresse/haddock3-ui/hetero";

import { FormItem } from "./FormItem";
import { MoleculeSubFormWrapper } from "./MoleculeSubFormWrapper";
import { ActPassSelection } from "./ActPassSelection";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { jsonSafeFile, preprocessPdb, restrainBodies } from "./restraints";
import { cn } from "~/lib/utils";
import { CopyButton } from "./ResiduesSelect";
import { useTheme } from "remix-themes";

function HeteroRadioGroup({
  options,
  selected,
  onSelect,
  onHover,
  highlight,
}: {
  options: Hetero[];
  selected: string | undefined;
  onSelect: (value: string) => void;
  onHover: (value: string | undefined) => void;
  highlight: string | undefined;
}) {
  const id = useId();
  return (
    <RadioGroup
      value={selected}
      onValueChange={onSelect}
      className="flex flex-col pb-4"
      onMouseLeave={() => onHover(undefined)}
    >
      {options.map((hetero) => {
        const value = `${hetero.resname}-${hetero.chain}-${hetero.resno}`;
        const key = `${id}-${value}`;
        return (
          <div
            key={key}
            className={cn(
              "flex items-center space-x-2",
              highlight && "bg-secondary dark:bg-secondary-foreground",
            )}
            onMouseEnter={() => onHover(value)}
          >
            <RadioGroupItem value={value} id={key} className="bg-inherit" />
            <Label htmlFor={key}>
              {hetero.resname}: {hetero.description} ({hetero.chain}:
              {hetero.resno})
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}

function findHetero(value: string, heteros: Hetero[]) {
  const [resname, chain, resno] = value.split("-");
  return heteros.find(
    (hetero) =>
      hetero.resname === resname &&
      hetero.chain === chain &&
      hetero.resno === parseInt(resno),
  );
}

function UserStructure({
  selected,
  onSelect,
  onReset,
}: {
  selected: Hetero | undefined;
  onSelect: (selected: Hetero, file: File) => void;
  onReset: () => void;
}) {
  const [theme] = useTheme();
  const [file, setFile] = useState<File | undefined>();
  const [heteros, setHeteros] = useState<Hetero[]>([]);
  const [hoveredFrom2DResidue, setHoveredFrom2DResidue] = useState<string>();
  const [hoveredFrom3DResidue, setHoveredFrom3DResidue] = useState<string>();
  const id = useId();

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) {
      setHeteros([]);
      setFile(undefined);
      onReset();
      return;
    }
    const newHeteros = await heterosFromFile(file);
    setHeteros(newHeteros);
    if (file) {
      // Wipe previous selection, when new file is loaded
      onReset();
    }
    setFile(file);
    if (newHeteros.length === 1) {
      onSelect(newHeteros[0], file);
    }
  }

  function onMySelect(value: string) {
    const selected = findHetero(value, heteros);
    if (selected && file) {
      onSelect(selected, file);
    }
  }

  function onHoverHetero(value: string) {
    const selected = findHetero(value, heteros);
    if (selected) {
      setHoveredFrom2DResidue(value);
    } else {
      setHoveredFrom2DResidue(undefined);
    }
  }

  const noHeteros = file && heteros.length === 0;

  const mySelected =
    selected && `${selected.resname}-${selected.chain}-${selected.resno}`;
  return (
    <>
      <FormItem name={id} label="Structure">
        <Input
          type="file"
          id={id}
          name={id}
          required={true}
          accept=".pdb"
          onChange={onFileChange}
        />
        {noHeteros && (
          <div className="text-destructive">
            No ligands found in uploaded structure. Please upload a structure
            with HETATM lines.
          </div>
        )}
        <div className="h-[500px] w-full">
          {file && !noHeteros && (
            <LigandViewer
              structure={file}
              selected={selected}
              onHover={onHoverHetero}
              onMouseLeave={() => setHoveredFrom3DResidue(undefined)}
              highlight={hoveredFrom2DResidue}
              onPick={onMySelect}
              theme={theme === null ? undefined : theme}
            />
          )}
        </div>
      </FormItem>
      {file && (
        <FormItem name={`${id}-hetero`} label="Hetero">
          <HeteroRadioGroup
            options={heteros}
            selected={mySelected}
            onSelect={onMySelect}
            onHover={setHoveredFrom2DResidue}
            highlight={hoveredFrom3DResidue}
          />
        </FormItem>
      )}
    </>
  );
}

export function HeteroMoleculeSubForm({
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
  const [processedFile, setProcessedFile] = useState<File | undefined>();
  const [selected, setSelected] = useState<Hetero | undefined>();

  async function onSelect(newSelected: Hetero, file: File) {
    const pdbWithSingleHet = await hetGrepFile(
      file,
      newSelected.resname,
      newSelected.chain,
      newSelected.resno,
    );
    const processed = await preprocessPdb(
      pdbWithSingleHet,
      newSelected.chain,
      targetChain,
      "",
      `${newSelected.resname}-${newSelected.resno}`,
    );
    const safeProcessed = await jsonSafeFile(processed);
    const bodyRestraints = await restrainBodies(safeProcessed);
    setSelected(newSelected);
    setProcessedFile(processed);
    onActPassChange({
      ...actpass,
      active: [newSelected.resno],
      passive: [],
      neighbours: [],
      chain: targetChain,
      bodyRestraints,
    });
  }

  function onReset() {
    setSelected(undefined);
    setProcessedFile(undefined);
    onActPassChange({
      ...actpass,
      active: [],
      passive: [],
      neighbours: [],
      chain: "",
      bodyRestraints: "",
    });
  }

  return (
    <MoleculeSubFormWrapper legend={legend} description={description}>
      <UserStructure
        selected={selected}
        onSelect={onSelect}
        onReset={onReset}
      />
      {processedFile && (
        <>
          <HiddenFileInput name={name} file={processedFile} />
          <div>
            Processed structure:{" "}
            <LinkToFile file={processedFile}>{processedFile.name}</LinkToFile>
          </div>
        </>
      )}
      {selected && (
        <div className="flex items-center gap-1">
          <Label>Selected active residue</Label>
          <Input
            readOnly={true}
            value={actpass.active.join(", ")}
            className="w-32 p-1"
          />
          <CopyButton content={actpass.active.join(",")} />
        </div>
      )}
      <FormItem name="ligand_param_fname" label="Custom parameter file">
        <Input
          type="file"
          id="ligand_param_fname"
          name="ligand_param_fname"
          accept=".param"
          required
        />
      </FormItem>
      <FormItem name="ligand_top_fname" label="Custom topology file">
        <Input
          type="file"
          id="ligand_top_fname"
          name="ligand_top_fname"
          accept=".top"
          required
        />
      </FormItem>
    </MoleculeSubFormWrapper>
  );
}
