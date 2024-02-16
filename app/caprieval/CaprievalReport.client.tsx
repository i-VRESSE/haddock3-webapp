import {
  ClusterTable,
  StructureTable,
} from "@i-vresse/haddock3-analysis-components";
import "./CaprievalReport.client.css";

import { ScatterPlots } from "./ScatterPlots";
import { useSearchParams } from "@remix-run/react";
import { BoxPlots } from "./BoxPlots";
import type { CaprievalData } from "./caprieval.server";

/*
 * Component has to be client only due
 * to sorting and ngl structure viewer needing browser.
 */

export const CaprievalReport = ({ scatters, boxes, table }: CaprievalData) => {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <div className="caprieval-report flex flex-col gap-4">
      {"clusters" in table ? (
        <ClusterTable {...table} />
      ) : (
        <StructureTable {...table} />
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
