import { useId, useState } from "react";
import { FormItem } from "./FormItem";
import {
  ActPassSelection,
  MoleculeSubFormWrapper,
} from "./MoleculeSubForm.client";
import { SimpleViewer } from "./Viewer.client";
import { Input } from "~/components/ui/input";
import { type Structure, autoLoad } from "ngl";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";

interface Hetero {
  resno: number;
  resname: string;
  chain: string;
  description?: string;
}

async function heterosFromFile(file: File): Promise<Hetero[]> {
  const structure: Structure = await autoLoad(file);
  const heteros: Hetero[] = [];
  structure.eachResidue((r) => {
    // TODO filter out solvents like glycerol
    if (r.isHetero() && !r.isWater() && !r.isIon()) {
      const hetero: Hetero = {
        resno: r.resno,
        resname: r.resname,
        chain: r.chain.chainname,
      };
      if (r.entity) {
        hetero.description = r.entity.description;
      }
      heteros.push(hetero);
    }
  });
  return heteros;
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
  const [heteros, setHeteros] = useState<Hetero[]>([]);
  const [file, setFile] = useState<File | undefined>();
  const id = useId();
  const myname = name + "-user";
  const selected = actpass.active[0]?.toString() || undefined;

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    // TODO pass file through preprocessPdb()
    const neewHeteros = await heterosFromFile(file);
    setHeteros(neewHeteros);
    setFile(file);
    if (heteros.length === 1) {
      // TODO select one and only hetero
    }
  }

  function onSelect(value: string) {
    onActPassChange({
      ...actpass,
      active: [parseInt(value)],
      passive: [],
      neighbours: [],
      chain: targetChain,
      bodyRestraints: "",
    });
  }

  return (
    <MoleculeSubFormWrapper legend={legend} description={description}>
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
            {/* TODO render non-hetero as ghost */}
            {file && <SimpleViewer structure={file} />}
          </div>
        </FormItem>
        <FormItem name={`${name}-hetero`} label="Hetero">
          {file ? (
            <RadioGroup
              defaultValue={selected}
              onValueChange={onSelect}
              className="flex flex-col"
            >
              {heteros.map((hetero) => (
                <div
                  key={`${id}-${hetero.resno}`}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={hetero.resno.toString()}
                    id={id + hetero.resno}
                    className="bg-inherit"
                  />
                  <Label htmlFor={id + hetero.resno}>
                    {hetero.resname}: {hetero.description} {hetero.chain}{" "}
                    {hetero.resno}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <p>Load a structure first</p>
          )}
        </FormItem>
      </>
    </MoleculeSubFormWrapper>
  );
}
