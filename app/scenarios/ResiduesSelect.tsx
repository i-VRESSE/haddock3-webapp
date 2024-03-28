import { ChangeEvent, useState } from "react";
import { FormDescription } from "./FormDescription";
import { Residue, SecondaryStructure } from "./molecule.client";
import clsx from "clsx";

const residueVariants: Record<SecondaryStructure, string> = {
  sheet: "bg-amber-200 dark:bg-amber-700",
  helix: "bg-red-200 dark:bg-red-900",
  turn: "",
  "": "",
};

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
              title={`${r.resno}`}
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
    </>
  );
}
