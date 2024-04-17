import { ChangeEvent, useId, useState } from "react";
import { FormDescription } from "./FormDescription";
import { Residue, SecondaryStructure } from "./molecule.client";
import clsx from "clsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useTheme } from "remix-themes";
import { cn } from "~/lib/utils";

const residueVariants: Record<SecondaryStructure, string> = {
  sheet: "bg-amber-200 dark:bg-amber-700",
  helix: "bg-red-200 dark:bg-red-900",
  turn: "",
  "": "",
};

function ImportResidues({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (selected: number[]) => void;
}) {
  const sortedResidues = [...selected].sort((a, b) => a - b).join(",");

  function doImport(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const newSelection = window.prompt(
      "Enter comma-separated residue numbers to import",
      selected.join(","),
    );
    if (newSelection) {
      const newResidues = newSelection.split(",").map((r) => parseInt(r));
      onChange(newResidues);
    }
  }
  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={sortedResidues} className="w-1/2 p-1" />
      <Button variant="outline" size="sm" onClick={doImport}>
        Import
      </Button>
    </div>
  );
}

function ResidueCheckbox({
  resno,
  sec,
  seq,
  highlight,
  checked,
  disabled,
  onHover,
  onChange,
}: {
  resno: number;
  sec: SecondaryStructure;
  seq: string;
  highlight: boolean;
  checked: boolean;
  disabled: boolean;
  onHover: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };

  return (
    <div
      key={resno}
      className={cn(
        "inline-block w-4 text-center font-mono hover:bg-secondary hover:text-secondary-foreground",
        {
          "bg-secondary text-secondary-foreground": highlight,
        },
      )}
      title={disabled ? `${resno}, disabled due to not on surface` : `${resno}`}
      onMouseEnter={onHover}
    >
      <label htmlFor={id} className={residueVariants[sec]}>
        {seq}
      </label>
      <input
        type="checkbox"
        style={style}
        value={resno}
        disabled={disabled}
        id={id}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

export function ResiduesSelect({
  options,
  selected,
  onChange,
  surface,
  onHover,
  highlight,
}: {
  options: Residue[];
  selected: number[];
  onChange: (selected: number[]) => void;
  surface: number[];
  onHover: (resno: number | undefined) => void;
  highlight: number | undefined;
}) {
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const residue = parseInt(e.target.value);
    const ne = e.nativeEvent as KeyboardEvent;
    if (ne.shiftKey && lastChecked !== null) {
      const start = Math.min(lastChecked, index);
      const end = Math.max(lastChecked, index);
      const newSelected = [...selected];
      for (let i = start; i <= end; i++) {
        const resno = options[i].resno;
        if (!newSelected.includes(resno) && surface.includes(resno)) {
          newSelected.push(resno);
        }
      }
      onChange(newSelected);
    } else {
      if (e.target.checked) {
        onChange([...selected, residue]);
      } else {
        onChange(selected.filter((r) => r !== residue));
      }
    }
    if (e.target.checked) {
      setLastChecked(index);
    }
  }

  function onImport(selected: number[]) {
    const filtered = selected.filter((r) => surface.includes(r));
    onChange(filtered);
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
                  sec={r.sec}
                  seq={r.seq}
                  highlight={highlight === r.resno}
                  checked={selected.includes(r.resno)}
                  disabled={!surface.includes(r.resno)}
                  onHover={() => onHover(r.resno)}
                  onChange={(e) => handleChange(e, cindex * chunkSize + index)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <FormDescription>
        <span className={clsx("p-1 font-mono", residueVariants["helix"])}>
          Helix
        </span>{" "}
        <span className={clsx("p-1 font-mono", residueVariants["sheet"])}>
          Sheet
        </span>{" "}
        (Hold Shift to select a range of residues. Click residue in 3D viewer to
        select.)
      </FormDescription>
      {/* TODO add buttons to select all, none, invert */}
      <ImportResidues selected={selected} onChange={onImport} />
    </>
  );
}
