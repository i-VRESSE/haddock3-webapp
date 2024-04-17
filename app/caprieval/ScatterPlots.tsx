import { CAPRIEVAL_SCATTERPLOT_CHOICES } from "./constants";
import type { PlotlyProps } from "../components/PlotlyPlot";
import { PlotlyPlot } from "../components/PlotlyPlot";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ScatterPlots({
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
        <Label htmlFor="ss">Enlarge a subplot</Label>
        <Select defaultValue={selected} onValueChange={onChange}>
          <SelectTrigger className="ml-2 w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CAPRIEVAL_SCATTERPLOT_CHOICES).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
