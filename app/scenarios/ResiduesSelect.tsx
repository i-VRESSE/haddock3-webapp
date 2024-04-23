import { ChangeEvent, useId, useMemo, useState } from "react";
import { FormDescription } from "./FormDescription";
import { Residue } from "./molecule.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useTheme } from "remix-themes";
import { cn } from "~/lib/utils";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";

const residueVariants: Record<"act" | "pass" | "highlight" | "", string> = {
  act: "bg-green-100 dark:bg-green-700",
  pass: "bg-yellow-100 dark:bg-yellow-700",
  highlight: "bg-secondary dark:bg-secondary-foreground",
  "": "bg-inherit dark:bg-inherit",
};

function CopyToClipBoardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.746.07A.5.5 0 0011.5.003h-6a.5.5 0 00-.5.5v2.5H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h8a.5.5 0 00.5-.5v-2.5h4.5a.5.5 0 00.5-.5v-8a.498.498 0 00-.15-.357L11.857.154a.506.506 0 00-.11-.085zM9 10.003h4v-7h-1.5a.5.5 0 01-.5-.5v-1.5H6v2h.5a.5.5 0 01.357.15L8.85 5.147c.093.09.15.217.15.357v4.5zm-8-6v9h7v-7H6.5a.5.5 0 01-.5-.5v-1.5H1z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

function ImportResidues({
  selected,
  onChange,
  disabled = false,
}: {
  selected: number[];
  onChange: (selected: number[]) => void;
  disabled?: boolean;
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
    <div className="flex items-center gap-1">
      <Input readOnly value={sortedResidues} className="w-1/2 p-1" />
      {!disabled && (
        <Button variant="outline" size="sm" onClick={doImport}>
          Import
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => navigator.clipboard.writeText(sortedResidues)}
        title="Copy residues to clipboard"
      >
        <CopyToClipBoardIcon />
      </Button>
    </div>
  );
}

function ResidueCheckbox({
  resno,
  seq,
  showActive,
  showPassive,
  highlight,
  activeChecked,
  passiveChecked,
  activeDisabled,
  passiveDisabled,
  onHover,
  onActiveChange,
  onPassiveChange,
}: {
  resno: number;
  seq: string;
  showActive: boolean;
  showPassive: boolean;
  highlight: boolean; // External component wants us to highlight this residue
  activeChecked: boolean;
  passiveChecked: boolean;
  activeDisabled: boolean;
  passiveDisabled: boolean;
  onHover: () => void; // We want external component to know we are hovering
  onActiveChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPassiveChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };
  let htmlFor = id + "act";
  if (showPassive && !showActive) {
    htmlFor = id + "pass";
  }

  let variant: "act" | "pass" | "highlight" | "" = "";
  if (passiveChecked) {
    variant = "pass";
  }
  if (activeChecked) {
    variant = "act";
  }
  if (highlight) {
    variant = "highlight";
  }

  return (
    <div
      className={cn(
        "inline-block w-4 text-center font-mono hover:bg-secondary hover:text-secondary-foreground",
        residueVariants[variant],
      )}
      title={resno.toString()}
      onMouseEnter={onHover}
    >
      <label htmlFor={htmlFor}>{seq}</label>
      {showActive && (
        <input
          type="checkbox"
          style={style}
          value={resno}
          disabled={activeDisabled || passiveChecked}
          id={id + "act"}
          checked={activeChecked}
          onChange={onActiveChange}
        />
      )}
      {showPassive && (
        <input
          type="checkbox"
          style={style}
          value={resno}
          disabled={passiveDisabled || activeChecked}
          id={id + "pass"}
          checked={passiveChecked}
          onChange={onPassiveChange}
        />
      )}
    </div>
  );
}

export interface ResidueSelection {
  act: number[];
  pass: number[];
}

export function ResiduesSelect({
  options,
  selected,
  onChange,
  disabledPassive = false,
  disabledActive = false,
  showPassive = false,
  showActive = false,
  onHover,
  highlight,
}: {
  options: Residue[];
  selected: ResidueSelection;
  onChange: (selected: ResidueSelection) => void;
  disabledPassive?: boolean;
  disabledActive?: boolean;
  showPassive?: boolean;
  showActive?: boolean;
  onHover: (resno: number | undefined) => void;
  highlight: number | undefined;
}) {
  const surface = useMemo(
    () => options.filter((r) => r.surface).map((r) => r.resno),
    [options],
  );
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    actpass: ActPass,
  ) {
    const residue = parseInt(e.target.value);
    const ne = e.nativeEvent as KeyboardEvent;
    let newSelected: number[] = [];
    if (ne.shiftKey && lastChecked !== null) {
      const start = Math.min(lastChecked, index);
      const end = Math.max(lastChecked, index);
      const newSelected = [...selected.pass];
      for (let i = start; i <= end; i++) {
        const resno = options[i].resno;
        if (!newSelected.includes(resno) && surface.includes(resno)) {
          newSelected.push(resno);
        }
      }
    } else {
      if (e.target.checked) {
        newSelected = [...selected[actpass], residue];
      } else {
        newSelected = selected[actpass].filter((r) => r !== residue);
      }
    }
    if (actpass === "act") {
      onChange({
        act: newSelected,
        pass: selected.pass,
      });
    } else {
      onChange({
        pass: newSelected,
        act: selected.act,
      });
    }

    if (e.target.checked) {
      setLastChecked(index);
    }
  }

  function onActiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      act: filtered,
      pass: selected.pass,
    });
  }
  function onPassiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      pass: filtered,
      act: selected.act,
    });
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

  console.log({
    options,
    surface,
    disabledActive,
    disabledPassive,
    chunk0: chunks[0],
  });

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <ResiduesHeader showActive={showActive} showPassive={showPassive} />
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
                  seq={r.seq}
                  highlight={highlight === r.resno}
                  activeChecked={selected.act.includes(r.resno)}
                  passiveChecked={selected.pass.includes(r.resno)}
                  activeDisabled={
                    disabledActive ? true : !surface.includes(r.resno)
                  }
                  passiveDisabled={
                    disabledPassive ? true : !surface.includes(r.resno)
                  }
                  onHover={() => onHover(r.resno)}
                  onActiveChange={(e) =>
                    handleChange(e, cindex * chunkSize + index, "act")
                  }
                  onPassiveChange={(e) =>
                    handleChange(e, cindex * chunkSize + index, "pass")
                  }
                  showActive={showActive}
                  showPassive={showPassive}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <FormDescription>
        (Hold Shift to select a range of residues. Click residue in 3D viewer to
        select.)
      </FormDescription>
      {/* TODO add buttons to select all, none, invert */}
      <div className="flex flex-row gap-2">
        {showActive && (
          <div>
            Active
            <ImportResidues
              selected={selected.act}
              onChange={onActiveImport}
              disabled={disabledActive}
            />
          </div>
        )}
        {showPassive && (
          <div>
            Passive
            <ImportResidues
              selected={selected.pass}
              onChange={onPassiveImport}
              disabled={disabledPassive}
            />
          </div>
        )}
      </div>
    </>
  );
}

type ActPass = "act" | "pass";

function ResiduesHeader({
  showActive = false,
  showPassive = false,
  showPicker = false,
  pick,
  onPickChange,
}: {
  showActive?: boolean;
  showPassive?: boolean;
  showPicker?: boolean;
  pick?: ActPass;
  onPickChange?: (pick: ActPass) => void;
}) {
  const id = useId();
  if (showActive && showPassive && showPicker && onPickChange) {
    return (
      <div>
        <p className="text-[0.5rem]">&nbsp;</p>
        <RadioGroup
          className="inline-block text-start font-mono"
          defaultValue={pick}
          onValueChange={(v) => onPickChange(v as ActPass)}
        >
          <div title="Amino aced sequence">&nbsp;</div>
          <div title="Active" className="bg-green-100 dark:bg-green-700 pr-1">
            <RadioGroupItem value="act" id={id + "act"} />
            <Label htmlFor={id + "act"}>Active</Label>
          </div>
          <div
            title="Passive"
            className="bg-yellow-100 dark:bg-yellow-700 pr-1"
          >
            <RadioGroupItem value="pass" id={id + "pass"} />
            <Label htmlFor={id + "pass"}>Passive</Label>
          </div>
        </RadioGroup>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[0.5rem]">&nbsp;</p>
      <div className="inline-block text-start font-mono">
        <div title="Amino aced sequence">&nbsp;</div>
        {showActive && (
          <div title="Active" className="bg-green-100 dark:bg-green-700 pr-1">
            Active
          </div>
        )}
        {showPassive && (
          <div
            title="Passive"
            className="bg-yellow-100 dark:bg-yellow-700 pr-1"
          >
            Passive
          </div>
        )}
      </div>
    </div>
  );
}
