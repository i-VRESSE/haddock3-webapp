import { ChangeEvent, useState } from "react";
import { FormDescription } from "./FormDescription";
import { Residue } from "./molecule.client";


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
              className="inline-block w-4"
              title={`${r.resno}`}
            >
              <span>{r.seq}</span>
              <input
                type="checkbox"
                value={r.resno}
                checked={selected.includes(r.resno)}
                onChange={(e) => handleChange(e, index)}
              />
            </div>
          );
        })}
      </div>
      <FormDescription>
        (Hold Shift to select a range of residues)
      </FormDescription>
      {/* TODO add buttons to select all, none, invert */}
    </>
  );
}
