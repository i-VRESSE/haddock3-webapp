import { StructureRepresentationType } from "ngl";
import { useState } from "react";
import { useTheme } from "remix-themes";
import { SlidersHorizontal } from "lucide-react";
import { FormItem } from "./FormItem";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { LabeledRadioGroup } from "./LabeledRadioGroup";

export function MoleculeSettings({
  surfaceCutoff,
  setSurfaceCutoff,
  neighourRadius,
  setNeighourRadius,
  renderSelectionAs,
  onRenderSelectionAsChange,
}: {
  surfaceCutoff: number;
  setSurfaceCutoff: (cutoff: number) => void;
  neighourRadius: number;
  setNeighourRadius: (radius: number) => void;
  renderSelectionAs: StructureRepresentationType;
  onRenderSelectionAsChange: (value: StructureRepresentationType) => void;
}) {
  const [cutoff, setcutoff] = useState(surfaceCutoff);
  const [radius, setradius] = useState(neighourRadius);
  const [theme] = useTheme();
  const style = { colorScheme: theme === "dark" ? "dark" : "light" };

  function onOpenChange(open: boolean) {
    if (!open) {
      if (cutoff !== surfaceCutoff) {
        setSurfaceCutoff(cutoff);
      }
      if (radius !== neighourRadius) {
        setNeighourRadius(radius);
      }
    }
  }

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <SlidersHorizontal />
      </PopoverTrigger>
      <PopoverContent>
        <FormItem name="surface-cutoff" label="Surface cutoff">
          <Input
            type="number"
            step="0.01"
            min="0.0"
            max="10"
            value={cutoff}
            style={style}
            onChange={(e) => setcutoff(Number(e.target.value))}
          />
        </FormItem>
        <FormItem name="neighbour-radius" label="Neighbour radius">
          <Input
            type="number"
            step="0.1"
            min="0.0"
            max="1000"
            value={radius}
            style={style}
            onChange={(e) => setradius(Number(e.target.value))}
          />
        </FormItem>
        <LabeledRadioGroup
          label="Render selection as"
          value={renderSelectionAs}
          choices={[
            ["spacefill", "Spacefill"],
            ["ball+stick", "Ball+stick"],
            ["licorice", "Licorice"],
            ["surface", "Surface"],
          ]}
          onChange={onRenderSelectionAsChange}
        />
        <span>(Close popover to commit changes)</span>
      </PopoverContent>
    </Popover>
  );
}
