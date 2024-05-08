import { useId } from "react";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

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
    <div className="flex items-center space-x-2">
      <Label htmlFor={id}>Show</Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        id={id}
        className="border"
      >
        <ToggleGroupItem value="surface">Surface</ToggleGroupItem>
        <ToggleGroupItem value="buried">Buried</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
