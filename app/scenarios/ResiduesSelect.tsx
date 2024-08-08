import { ChangeEvent, useId, useMemo } from "react";
import { useChunked } from "@i-vresse/haddock3-ui/useChunked";
import { CopyToClipBoardIcon } from "@i-vresse/haddock3-ui";
import { ResiduesHeader } from "@i-vresse/haddock3-ui/toggles/ResidueHeader";
import { useTheme } from "remix-themes";

import { FormDescription } from "./FormDescription";
import { Residue } from "./molecule.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useResidueChangeHandler } from "./useResidueChangeHandler";

type Variant = "act" | "pass" | "highlight" | "";

const residueVariants: Record<Variant, string> = {
  act: "bg-green-100 dark:bg-green-700",
  pass: "bg-yellow-100 dark:bg-yellow-700",
  highlight: "bg-secondary dark:bg-secondary-foreground",
  "": "bg-inherit dark:bg-inherit",
};

export function ImportResidues({
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
      <Input readOnly value={sortedResidues} className="w-32 p-1" />
      <CopyButton content={sortedResidues} />
      {!disabled && (
        <Button variant="outline" size="sm" onClick={doImport}>
          Import
        </Button>
      )}
    </div>
  );
}

export function CopyButton({ content }: { content: string }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => navigator.clipboard.writeText(content)}
      title="Copy list of residues to clipboard"
    >
      <CopyToClipBoardIcon />
    </Button>
  );
}

export function ResidueCheckbox({
  resno,
  resname,
  seq,
  showActive,
  showPassive,
  highlight,
  activeChecked,
  passiveChecked,
  neighbourChecked,
  activeDisabled,
  passiveDisabled,
  onHover,
  onActiveChange,
  onPassiveChange,
}: {
  resno: number;
  resname: string;
  seq: string;
  showActive: boolean;
  showPassive: boolean;
  highlight: boolean; // External component wants us to highlight this residue
  activeChecked: boolean;
  passiveChecked: boolean;
  neighbourChecked: boolean;
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

  let variant: Variant = "";
  if (passiveChecked || neighbourChecked) {
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
      title={`${resno.toString()}:${resname}`}
      onMouseEnter={onHover}
    >
      <label htmlFor={htmlFor}>{seq}</label>
      {showActive && (
        <input
          type="checkbox"
          style={style}
          value={resno}
          disabled={activeDisabled}
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
          disabled={passiveDisabled || activeChecked || neighbourChecked}
          id={id + "pass"}
          checked={passiveChecked || neighbourChecked}
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

export interface ResidueNeighbourSelection extends ResidueSelection {
  neighbours: number[];
}

export function ResiduesSelect({
  options,
  selected,
  onChange,
  disabledPassive = false,
  disabledActive = false,
  showPassive = false,
  showActive = false,
  showNeighbours = false,
  onHover,
  highlight,
}: {
  options: Residue[];
  selected: ResidueNeighbourSelection;
  onChange: (selected: ResidueSelection) => void;
  disabledPassive?: boolean;
  disabledActive?: boolean;
  showPassive?: boolean;
  showActive?: boolean;
  showNeighbours?: boolean;
  onHover: (resno: number | undefined) => void;
  highlight: number | undefined;
}) {
  const surface = useMemo(
    () => options.filter((r) => r.surface).map((r) => r.resno),
    [options],
  );
  const handleChange = useResidueChangeHandler({
    options,
    selected,
    onChange,
    filter: (resno: number) => surface.includes(resno),
  });
  const chunkSize = 10;
  const chunks = useChunked(options, chunkSize);

  function onActiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      act: filtered,
      pass: selected.pass.filter((r) => !filtered.includes(r)),
    });
  }
  function onPassiveImport(imported: number[]) {
    const filtered = imported.filter((r) => surface.includes(r));
    onChange({
      pass: filtered,
      act: selected.act.filter((r) => !filtered.includes(r)),
    });
  }

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <ResiduesHeader
          showActive={showActive}
          showPassive={showPassive || showNeighbours}
        />
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
                  resname={r.resname}
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
                  showPassive={showPassive || showNeighbours}
                  neighbourChecked={selected.neighbours.includes(r.resno)}
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

export type ActPass = "act" | "pass";

export function PickIn3D({
  value,
  onChange,
}: {
  value: ActPass;
  onChange: (value: ActPass) => void;
}) {
  return (
    <div className="flex flex-row items-center gap-1">
      <div>3D viewer picks</div>
      <ToggleGroup type="single" defaultValue={value} onValueChange={onChange}>
        <ToggleGroupItem
          value="act"
          className="data-[state=on]:bg-green-100"
          aria-label="Picking in 3D viewer will select active"
          title="Picking in 3D viewer will select active"
        >
          A
        </ToggleGroupItem>
        <ToggleGroupItem
          value="pass"
          className="data-[state=on]:bg-yellow-100"
          aria-label="Picking in 3D will viwer select passive"
          title="Picking in 3D will viwer select passive"
        >
          P
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
