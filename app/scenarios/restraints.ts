import { ActPassSelection } from "./MoleculeSubForm.client";
import { strFromU8, gzip } from "fflate";

import {
  HTTPValidationError,
  client,
} from "~/haddock3-restraints-client/client";

export async function generateAmbiguousRestraintsFile(
  selection1: ActPassSelection,
  selection2: ActPassSelection,
  filename = "ambig.tbl",
) {
  /*
 
  On CLI
    haddock3-restraints --segid-one protein1activeResidues.chain --segid-two protein2activeResidues.chain active_passive_to_ambig protein1.actpass protein2.actpass > ambig.tbl
  */
  const { response } = await client.POST("/actpass_to_ambig", {
    body: {
      active1: selection1.active,
      active2: selection2.active,
      passive1: [...selection1.passive, ...selection1.neighbours],
      passive2: [...selection2.passive, ...selection2.neighbours],
      segid1: selection1.chain,
      segid2: selection2.chain,
    },
    parseAs: "stream",
  });
  if (!response.ok) {
    console.error(response);
    throw new Error("Could not generate ambiguous restraints");
  }

  const blob = await response.blob();
  const type = response.headers.get("content-type") || "text/plain";
  return new File([blob], filename, { type });
}

export function generateUnAmbiguousRestraintsFile(
  body_restraints1: string,
  body_restraints2: string,
) {
  const lines: string[] = [];
  if (body_restraints1 === "" && body_restraints2 === "") {
    return undefined;
  }
  if (body_restraints1) {
    lines.push(body_restraints1);
  }
  if (body_restraints2) {
    lines.push(body_restraints2);
  }
  return new File(lines, "unambig.tbl", { type: "text/plain" });
}

export async function passiveFromActive(
  structure: string,
  chain: string,
  activeResidues: number[],
  surface: number[],
  radius: number,
) {
  /*
  On CLI
  haddock3-restraints passive_from_active -c protein1activeResidues.chain protein1 protein1activeResidues.resno.join(',') >> protein1.actpass
*/
  const body = {
    structure,
    chain,
    active: activeResidues,
    surface,
    radius,
  };
  const { data, error } = await client.POST("/passive_from_active", {
    body,
  });
  if (error) {
    console.error(error);
    throw new Error("Could not calculate passive restraints");
  }
  return data;
}

function flattenErrorResponses(response: HTTPValidationError): string {
  if (response === undefined) {
    return "";
  }
  if (typeof response.detail === "string") {
    return response.detail;
  }
  if (response.detail) {
    return response.detail.reduce((acc, detail) => {
      return acc + detail.msg + "\n";
    }, "");
  }
  throw new Error("Could not flatten error response");
}

export async function calculateAccessibility(
  structure: string,
  cutoff = 0.15,
): Promise<[Record<string, number[]>, undefined | string]> {
  const body = {
    structure,
    cutoff,
  };
  const { data, error } = await client.POST("/calc_accessibility", {
    body,
  });
  if (error) {
    console.error(error);
    return [{}, flattenErrorResponses(error)];
  }
  const residues = Object.fromEntries(
    Object.entries(data).map(([chain, residues]) => [
      chain,
      residues === undefined ? [] : residues,
    ]),
  );
  return [residues, undefined];
}

const pipelines = {
  "": {
    delhetatm: false,
    keepcoord: false,
  },
  delhetatmkeepcoord: {
    delhetatm: true,
    keepcoord: true,
  },
} as const;
export type PreprocessPipeline = keyof typeof pipelines;

export async function jsonSafeFile(file: File): Promise<string> {
  const data = new Uint8Array(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    gzip(data, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(btoa(strFromU8(data, true)));
    });
  });
}

async function preprocessPdb(
  file: File,
  fromChain: string,
  toChain: string,
  preprocessPipeline: PreprocessPipeline = "",
) {
  const structure = await jsonSafeFile(file);

  const { error, data } = await client.POST("/preprocess_pdb", {
    body: {
      structure,
      from_chain: fromChain,
      to_chain: toChain,
      ...pipelines[preprocessPipeline],
    },
    parseAs: "text",
  });
  if (error) {
    console.error(error);
    throw new Error("Could not preprocess pdb");
  }
  return new File([data], `processed-${fromChain}2${toChain}-${file.name}`, {
    type: file.type,
  });
}

async function restrainBodies(structure: string) {
  const { error, data } = await client.POST("/restrain_bodies", {
    body: { structure, exclude: [] },
    parseAs: "text",
  });
  if (error) {
    console.error(error);
    throw new Error("Could not restrain bodies");
  }
  if (typeof data !== "string") {
    return "";
  }
  return data;
}

export interface RestraintsErrors {
  accessibility?: string;
  passiveFromActive?: string;
}

export async function calclulateRestraints(
  file: File,
  userSelectedChain: string,
  targetChain: string,
  preprocessPipeline: PreprocessPipeline = "",
  accessibilityCutoff = 0.4,
) {
  const processed = await preprocessPdb(
    file,
    userSelectedChain,
    targetChain,
    preprocessPipeline,
  );
  const safeProcessed = await jsonSafeFile(processed);
  const [surfaceResidues, error] = await calculateAccessibility(
    safeProcessed,
    accessibilityCutoff,
  );
  const bodyRestraints = await restrainBodies(safeProcessed);
  let errors: RestraintsErrors | undefined = undefined;
  if (error) {
    errors = { accessibility: error };
  }
  return {
    surfaceResidues: surfaceResidues[targetChain] ?? [],
    bodyRestraints,
    file: processed,
    errors,
  };
}
