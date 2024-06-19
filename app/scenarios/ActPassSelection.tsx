export type ActPassSelection = {
  active: number[];
  passive: number[];
  neighbours: number[];
  chain: string;
  bodyRestraints: string;
};

export function countSelected(actpass: ActPassSelection) {
  return (
    actpass.active.length +
    actpass.passive.length +
    actpass.neighbours.length
  ).toString();
}
