import { PlotlyPlot } from "~/components/PlotlyPlot";
import type { ClusterInfo } from "./alascan.server";
import { useEffect, useId, useState } from "react";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  ErrorBoundary,
  NGLComponent,
  NGLStage,
  useComponent,
  useStage,
} from "@i-vresse/haddock3-ui/molviewer";
import { Download } from "lucide-react";

function ColorByBFactor() {
  const stage = useStage();
  const component = useComponent();
  useEffect(() => {
    if (!stage) return;
    if (!component) return;
    stage.eachRepresentation((repr) => {
      repr.setColor("bfactor");
    });
    // Need component as loading pdb as structure is async
  }, [stage, component]);
  return null;
}

function ScoreViewer({ pdb }: { pdb: string }) {
  const [structure, setStructure] = useState<File | undefined>(undefined);
  useEffect(() => {
    fetch(pdb)
      .then((response) => response.blob())
      .then((blob) =>
        setStructure(new File([blob], pdb, { type: "application/gzip" })),
      );
    return () => setStructure(undefined);
  }, [pdb]);
  if (!structure) return null;
  return (
    <div className="h-[50rem] w-[95vw]">
      <ErrorBoundary>
        <NGLStage>
          <NGLComponent structure={structure} chain="">
            <ColorByBFactor />
          </NGLComponent>
        </NGLStage>
      </ErrorBoundary>
    </div>
  );
}

export function Cluster({ info }: { info: ClusterInfo }) {
  const [shownModelId, setShownnModelId] = useState(info.models[0].id);
  const shownModel = info.models.find((model) => model.id === shownModelId);
  const id = useId();
  return (
    <div>
      <PlotlyPlot data={info.plot.data} layout={info.plot.layout} />
      <a className="underline flex gap-1" href={info.csv} title="Download plot data as CSV">
        <Download /> CSV
      </a>
      <h2 className="text-xl">Models of cluster {info.id}</h2>
      <RadioGroup
        defaultValue={shownModelId}
        onValueChange={setShownnModelId}
        className="grid-flow-col p-4"
      >
        {info.models.map((model) => (
          <div
            key={`${id}-${model.id}`}
            className="flex items-center space-x-2"
          >
            <RadioGroupItem
              value={model.id}
              id={id + model.id}
              className="bg-inherit"
            />
            <Label htmlFor={id + model}>{model.id}</Label>
            <a
              href={model.pdb}
              title="Download pdb of model"
              className="underline flex gap-1"
            >
              <Download /> PDB
            </a>
            <a
              href={model.csv}
              title="Download scores of model"
              className="underline flex gap-1"
            >
              <Download /> Scores
            </a>
          </div>
        ))}
      </RadioGroup>
      <ScoreViewer pdb={shownModel!.pdb} />
    </div>
  );
}
