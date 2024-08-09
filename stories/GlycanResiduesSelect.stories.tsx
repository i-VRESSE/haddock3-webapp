import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { GlycanResiduesSelect } from "../app/scenarios/GlycanMoleculeSubForm.client";

const meta: Meta<typeof GlycanResiduesSelect> = {
  component: GlycanResiduesSelect,
};

export default meta;

type Story = StoryObj<typeof GlycanResiduesSelect>;

export const ActPass: Story = {
  args: {
    kind: "actpass",
    options: [
      {
        resno: 1,
        resname: "NDG",
        seq: "X",
        surface: true,
      },
      {
        resno: 2,
        resname: "NAG",
        seq: "X",
        surface: true,
      },
    ],
    selected: {
      act: [],
      pass: [1],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};
