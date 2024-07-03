import { Structure, autoLoad } from "ngl";
import { useState } from "react";
import { FormItem } from "./FormItem";
import { ChainRadioGroup } from "./ChainRadioGroup";
import { SimpleViewer } from "./Viewer.client";
import { Input } from "~/components/ui/input";

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
