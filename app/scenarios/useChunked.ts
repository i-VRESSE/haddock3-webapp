import { useMemo } from "react";
import { Residue } from "./molecule.client";

export function useChunked(raw: Residue[], chunkSize: number) {
  return useMemo(() => {
    const initialArray: Residue[][] = [];
    const chunks = raw.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / chunkSize);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, initialArray);
    return chunks;
  }, [raw, chunkSize]);
}
