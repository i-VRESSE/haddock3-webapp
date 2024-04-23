/*
Kinds:

1. Surface residues as passive
2. Selected residues as passive
3. Selected residues as active (default)
4. Select active and passive set of residues

For kind 2, 3 add checkbox add surface neighbours of selected residues as passive.
For kind 4 would need 2 checkboxes to add neighbours of active selected residues and one for neigbours of passive.
*/

import { LabeledCheckbox } from "./LabeledCheckbox";
import { LabeledRadioGroup } from "./LabeledRadioGroup";

export type Kind = "surf" | "act" | "pass" | "actpass";

export interface RestraintsBase {
  kind: Kind;
  activeNeighbours: boolean;
  passiveNeighbours: boolean;
}

function KindRadioGroup({
  value,
  onChange,
}: {
  value: Kind;
  onChange: (value: Kind) => void;
}) {
  return (
    <LabeledRadioGroup
      value={value}
      choices={[
        ["surf", "Surface residues as passive"],
        ["pass", "Selected residues as passive"],
        ["act", "Selected residues as active"],
        ["actpass", "Select active and passive set of residues"],
      ]}
      onChange={onChange}
    />
  );
}

export function RestraintsBasePicker({
  value = { kind: "act", activeNeighbours: true, passiveNeighbours: false },
  onChange,
}: {
  value: RestraintsBase;
  onChange: (value: RestraintsBase) => void;
}) {
  return (
    <>
      <KindRadioGroup
        value={value.kind}
        onChange={(kind) => onChange({ ...value, kind })}
      />
      {value.kind === "act" && (
        <LabeledCheckbox
          value={value.activeNeighbours}
          onChange={(activeNeighbours) =>
            onChange({ ...value, activeNeighbours })
          }
        >
          Add surface neighbours of selected residues as passive
        </LabeledCheckbox>
      )}
      {value.kind === "pass" && (
        <LabeledCheckbox
          value={value.passiveNeighbours}
          onChange={(passiveNeighbours) =>
            onChange({ ...value, passiveNeighbours })
          }
        >
          Add surface neighbours of selected residues as passive
        </LabeledCheckbox>
      )}
      {value.kind === "actpass" && (
        <>
          <LabeledCheckbox
            value={value.activeNeighbours}
            onChange={(activeNeighbours) =>
              onChange({ ...value, activeNeighbours })
            }
          >
            Add surface neighbours of active selected residues
          </LabeledCheckbox>
          <LabeledCheckbox
            value={value.passiveNeighbours}
            onChange={(passiveNeighbours) =>
              onChange({ ...value, passiveNeighbours })
            }
          >
            Add surface neighbours of passive selected residues
          </LabeledCheckbox>
        </>
      )}
      {/* TODO add checkbox somewhere for showing neighbours */}
    </>
  );
}
