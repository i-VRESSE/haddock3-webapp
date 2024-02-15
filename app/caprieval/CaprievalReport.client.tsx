import {
  ClusterTable,
  StructureTable,
} from "@i-vresse/haddock3-analysis-components";
import "./CaprievalReport.client.css";
import { useMemo } from "react";

import { ScatterPlots } from "./ScatterPlots";
import { useSearchParams } from "@remix-run/react";
import { BoxPlots } from "./BoxPlots";
import type {
  CaprievalStructureRow,
  CaprievalClusterRow,
  CaprievalPlotlyProps,
} from "./caprieval.server";
import { scores2table } from "./scores2table";

/*
  Component has to be client only due 
  to sorting and ngl structure viewer needing browser.
  */

export interface Scores {
  structures: CaprievalStructureRow[];
  clusters: CaprievalClusterRow[];
}

interface CaprievalReportProps {
  scores: Scores;
  prefix: string;
  plotlyPlots: CaprievalPlotlyProps;
}

export const CaprievalReport = ({
  scores,
  prefix,
  plotlyPlots,
}: CaprievalReportProps) => {
  const { scatters, boxes } = plotlyPlots;
  const props = useMemo(() => scores2table(scores, prefix), [scores, prefix]);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="caprieval-report flex flex-col gap-4">
      {"clusters" in props ? (
        <ClusterTable {...props} />
      ) : (
        <StructureTable {...props} />
      )}
      <ScatterPlots
        data={scatters.data}
        layout={scatters.layout}
        selected={searchParams.get("ss") ?? "report"}
        onChange={(s) =>
          setSearchParams(
            (prev) => {
              prev.set("ss", s);
              return prev;
            },
            { preventScrollReset: true }
          )
        }
      />
      <BoxPlots
        data={boxes.data}
        layout={boxes.layout}
        selected={searchParams.get("bs") ?? "report"}
        onChange={(s) =>
          setSearchParams(
            (prev) => {
              prev.set("bs", s);
              return prev;
            },
            { preventScrollReset: true }
          )
        }
      />
    </div>
  );
};
