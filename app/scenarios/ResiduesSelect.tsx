import { ChangeEvent, useState } from "react";
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
      selected.join(",")
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
  const [theme] = useTheme();

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

  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
  return (
    <>
      <div onMouseLeave={() => onHover(undefined)}>
        {options.map((r, index) => {
          return (
            <div
              key={r.resno}
              className={cn(
                "inline-block w-4 text-center font-mono hover:bg-secondary hover:text-secondary-foreground",
                {
                  "bg-secondary text-secondary-foreground":
                    highlight === r.resno,
                }
              )}
              title={
                surface.includes(r.resno)
                  ? `${r.resno}`
                  : `${r.resno}, disabled due to not on surface`
              }
              onMouseEnter={() => onHover(r.resno)}
            >
              <label
                htmlFor={`residue-${r.resno}`}
                className={residueVariants[r.sec]}
              >
                {r.seq}
              </label>
              <input
                type="checkbox"
                style={style}
                value={r.resno}
                disabled={surface.includes(r.resno) === false}
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
        (Hold Shift to select a range of residues. Click residue in 3D viewer to
        select.)
      </FormDescription>
      {/* TODO add buttons to select all, none, invert */}
      <ImportResidues selected={selected} onChange={onImport} />
    </>
  );
}
