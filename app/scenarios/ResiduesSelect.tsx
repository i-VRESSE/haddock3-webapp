import { useMemo } from "react";
import {
  CopyToClipBoardIcon,
  ResiduesSelect as ResiduesSelectForeign,
} from "@i-vresse/haddock3-ui";
import {
  ActPass,
  Residue,
  ResidueNeighbourSelection,
  ResidueSelection,
} from "@i-vresse/haddock3-ui/toggles";
import { useTheme } from "remix-themes";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

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
  const [theme] = useTheme();
  const surface = useMemo(
    () => options.filter((r) => r.surface).map((r) => r.resno),
    [options],
  );

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
      <ResiduesSelectForeign
        options={options}
        selected={selected}
        onChange={onChange}
        disabledPassive={disabledPassive}
        disabledActive={disabledActive}
        showPassive={showPassive}
        showActive={showActive}
        showNeighbours={showNeighbours}
        onHover={onHover}
        highlight={highlight}
        theme={theme === null ? "light" : theme}
      />
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

// Not using same component from haddock3-ui package,
// as we want to use shadcn/ui styled components
// and package uses plain radio group
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
