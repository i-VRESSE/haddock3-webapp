import { ChangeEvent, useCallback, useState } from "react";
import { ActPass, ResidueSelection } from "./ResiduesSelect";
import { Residue } from "./molecule.client";

export function useResidueChangeHandler({
  selected,
  options,
  onChange,
  filter = () => true,
}: {
  options: Residue[];
  selected: ResidueSelection;
  onChange: (selected: ResidueSelection) => void;
  filter?: (resno: number) => boolean;
}) {
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const handler = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number, actpass: ActPass) => {
      const residue = parseInt(e.target.value);
      const ne = e.nativeEvent as KeyboardEvent;
      let newSelected: number[] = [];
      if (ne.shiftKey && lastChecked !== null) {
        const start = Math.min(lastChecked, index);
        const end = Math.max(lastChecked, index);
        newSelected = [...selected[actpass]];
        for (let i = start; i <= end; i++) {
          const resno = options[i].resno;
          if (!newSelected.includes(resno) && filter(resno)) {
            newSelected.push(resno);
          }
        }
      } else {
        if (e.target.checked) {
          newSelected = [...selected[actpass], residue];
        } else {
          newSelected = selected[actpass].filter((r) => r !== residue);
        }
      }
      if (actpass === "act") {
        // Active should take precedence over passive.
        // For example given passive is selected,
        // then selecting same residue as active should remove it from passive.
        const passiveWithoutAlsoActive = selected.pass.filter(
          (r) => !newSelected.includes(r),
        );
        onChange({
          act: newSelected,
          pass: passiveWithoutAlsoActive,
        });
      } else {
        onChange({
          pass: newSelected,
          act: selected.act,
        });
      }

      if (e.target.checked) {
        setLastChecked(index);
      }
    },
    [filter, lastChecked, onChange, options, selected],
  );

  return handler;
}
