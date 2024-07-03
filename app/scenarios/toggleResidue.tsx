import { ActPass } from "./ResiduesSelect";
import { ActPassSelection } from "./ActPassSelection";

export function toggleResidue(
  resno: number,
  pick: ActPass,
  current: ActPassSelection,
) {
  const newSelection = {
    act: current.active,
    pass: current.passive,
  };
  if (pick === "act") {
    if (newSelection.act.includes(resno)) {
      newSelection.act = newSelection.act.filter((r) => r !== resno);
    } else {
      newSelection.act = [...newSelection.act, resno];
      newSelection.pass = current.passive.filter(
        (r) => !newSelection.act.includes(r),
      );
    }
  } else {
    if (newSelection.pass.includes(resno)) {
      newSelection.pass = newSelection.pass.filter((r) => r !== resno);
    } else {
      newSelection.pass = [...newSelection.pass, resno];
      newSelection.act = current.active.filter(
        (r) => !newSelection.pass.includes(r),
      );
    }
  }
  return newSelection;
}
