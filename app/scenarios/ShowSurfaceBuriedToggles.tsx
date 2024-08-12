import { useId, useState } from "react";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function useShowSurfaceBuriedToggles({
  surfaceResidues,
  residues,
}: {
  surfaceResidues: number[];
  residues: number[];
}) {
  const [showSurface, setShowSurface] = useState(false);
  const [showBuried, setShowBuried] = useState(false);
  let surfaceOrBuriedResidues: number[] = [];
  if (showSurface) {
    surfaceOrBuriedResidues = surfaceResidues;
  } else if (showBuried) {
    surfaceOrBuriedResidues = residues.filter(
      (r) => !surfaceResidues.includes(r),
    );
  }
  return {
    resetShowBuriedToggle(renderedAsSurface: boolean) {
      if (renderedAsSurface) {
        setShowBuried(false);
        setShowSurface(true);
      } else {
        setShowSurface(false);
        setShowBuried(false);
      }
    },
    surfaceOrBuriedResidues,
    surfaceBuriedTogglesProps: {
      surface: showSurface,
      setSurface: setShowSurface,
      buried: showBuried,
      setBuried: setShowBuried,
    },
  };
}

export function ShowSurfaceBuriedToggles({
  surface,
  setSurface,
  buried,
  setBuried,
}: {
  surface: boolean;
  setSurface: (show: boolean) => void;
  buried: boolean;
  setBuried: (show: boolean) => void;
}) {
  const id = useId();
  let value: "" | "surface" | "buried" = "";
  if (surface) {
    value = "surface";
  } else if (buried) {
    value = "buried";
  }

  function onValueChange(value: string) {
    setSurface(value === "surface");
    setBuried(value === "buried");
  }

  return (
    <div className="flex items-center space-x-2 py-2">
      <Label htmlFor={id}>Show</Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        id={id}
        className="border"
      >
        <ToggleGroupItem value="surface">
          Surface accessible residues
        </ToggleGroupItem>
        <ToggleGroupItem value="buried">Buried residues</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
