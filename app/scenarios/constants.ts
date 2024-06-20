/*
NGL doe not have single letter for DNA or RNA, but molstar does.
Use molstar implementation from
https://github.com/molstar/molstar/blob/5a2ee03b48e1822c8843d65eb18d578af0579b9f/src/mol-model/sequence/constants.ts#L18-L85
*/
const Name2OneLetter = {
  HIS: "H",
  ARG: "R",
  LYS: "K",
  ILE: "I",
  PHE: "F",
  LEU: "L",
  TRP: "W",
  ALA: "A",
  MET: "M",
  PRO: "P",
  CYS: "C",
  ASN: "N",
  VAL: "V",
  GLY: "G",
  SER: "S",
  GLN: "Q",
  TYR: "Y",
  ASP: "D",
  GLU: "E",
  THR: "T",

  SEC: "U", // as per IUPAC definition
  PYL: "O", // as per IUPAC definition

  // charmm ff
  HSD: "H",
  HSE: "H",
  HSP: "H",
  LSN: "K",
  ASPP: "D",
  GLUP: "E",

  // amber ff
  HID: "H",
  HIE: "H",
  HIP: "H",
  LYN: "K",
  ASH: "D",
  GLH: "E",
  // DNA
  DA: "A",
  DC: "C",
  DG: "G",
  DT: "T",
  DU: "U",
  // RNA
  A: "A",
  C: "C",
  G: "G",
  T: "T",
  U: "U",
} as const;

export function getResName1(resname: string) {
  return Name2OneLetter[resname as keyof typeof Name2OneLetter] || "X";
}
