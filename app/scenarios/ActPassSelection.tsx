export type ActPassSelection = {
  active: number[];
  passive: number[];
  neighbours: number[];
  chain: string;
  bodyRestraints: string;
};

export function validateActPassPair(
  actpass1: ActPassSelection,
  actpass2: ActPassSelection,
  label1: string,
  label2: string,
) {
  const zeroResidues1 =
    actpass1.active.length === 0 &&
    actpass1.passive.length === 0 &&
    actpass1.neighbours.length === 0;
  const errors: string[] = [];
  if (zeroResidues1) {
    errors.push(`Please select at least one residue for the ${label1}.`);
  }
  const zerodResidues2 =
    actpass2.active.length === 0 &&
    actpass2.passive.length === 0 &&
    actpass2.neighbours.length === 0;
  if (zerodResidues2) {
    errors.push(`Please select at least one residue for the ${label2}.`);
  }
  return errors;
}
