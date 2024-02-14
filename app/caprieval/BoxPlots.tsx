import { Label } from "~/components/ui/label";
import type { PlotlyProps } from "../components/PlotlyPlot";
import { PlotlyPlot } from "../components/PlotlyPlot";
import { CAPRIEVAL_BOXPLOT_CHOICES } from "./constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function BoxPlots({
  data,
  layout,
  selected,
  onChange,
}: {
  data: PlotlyProps["data"];
  layout: PlotlyProps["layout"];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <PlotlyPlot data={data} layout={layout} />
      <div className="flex items-center">
        <Label htmlFor="bs">Enlarge a subplot</Label>
        <Select defaultValue={selected} onValueChange={onChange}>
          <SelectTrigger className="ml-2 w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAPRIEVAL_BOXPLOT_CHOICES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label} vs Cluster Rank
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
