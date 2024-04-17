import { ActPassSelection } from "./MoleculeSubForm.client";
import { client } from "~/haddock3-restraints-client/client";

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
      passive1: selection1.passive,
      passive2: selection2.passive,
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
