import { ChangeEvent, useState } from "react";
import { FormDescription } from "./FormDescription";
import { Residue, SecondaryStructure } from "./molecule.client";
import clsx from "clsx";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

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
      selected.join(",")
    );
    if (newSelection) {
      const newResidues = newSelection.split(",").map((r) => parseInt(r));
      // TODO check if given residues are in options list
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

export function ResiduesSelect({
  options,
  selected,
  onChange,
}: {
  options: Residue[];
  selected: number[];
  onChange: (selected: number[]) => void;
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
        if (!newSelected.includes(resno)) {
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

  return (
    <>
      <div>
        {options.map((r, index) => {
          return (
            <div
              key={r.resno}
              className="inline-block w-4 text-center font-mono"
              title={
                r.surface === false
                  ? `${r.resno}, disabled due to not on surface`
                  : `${r.resno}`
              }
            >
              <label
                htmlFor={`residue-${r.resno}`}
                className={residueVariants[r.sec]}
              >
                {r.seq}
              </label>
              <input
                type="checkbox"
                value={r.resno}
                disabled={r.surface === false}
                id={`residue-${r.resno}`}
                checked={selected.includes(r.resno)}
                onChange={(e) => handleChange(e, index)}
              />
            </div>
          );
        })}
      </div>
      <FormDescription>
        <span className={clsx("p-1 font-mono", residueVariants["helix"])}>
          Helix
        </span>{" "}
        <span className={clsx("p-1 font-mono", residueVariants["sheet"])}>
          Sheet
        </span>{" "}
        (Hold Shift to select a range of residues)
      </FormDescription>
      {/* TODO add buttons to select all, none, invert */}
      <ImportResidues selected={selected} onChange={onChange} />
    </>
  );
}
