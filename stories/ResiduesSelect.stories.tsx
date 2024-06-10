import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { ResiduesSelect } from "../app/scenarios/ResiduesSelect";

const meta: Meta<typeof ResiduesSelect> = {
  component: ResiduesSelect,
};

export default meta;

type Story = StoryObj<typeof ResiduesSelect>;

export const Surface: Story = {
  args: {
    showActive: false,
    showPassive: true,
    disabledPassive: true,
    options: [
      {
        resno: 1,
        resname: "A",
        seq: "A",
        surface: true,
      },
      {
        resno: 2,
        resname: "T",
        seq: "T",
        surface: false,
      },
    ],
    selected: {
      act: [],
      pass: [1],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};

export const ActiveOnly: Story = {
  args: {
    showActive: true,
    showPassive: false,
    options: [
      {
        resno: 1,
        resname: "A",
        seq: "A",
        surface: true,
      },
      {
        resno: 2,
        resname: "T",
        seq: "T",
        surface: false,
      },
      {
        resno: 3,
        resname: "G",
        seq: "G",
        surface: true,
      },
    ],
    selected: {
      act: [3],
      pass: [],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};

export const PassiveOnly: Story = {
  args: {
    showActive: false,
    showPassive: true,
    options: [
      {
        resno: 1,
        resname: "A",
        seq: "A",
        surface: true,
      },
      {
        resno: 2,
        resname: "T",
        seq: "T",
        surface: false,
      },
      {
        resno: 3,
        resname: "G",
        seq: "G",
        surface: true,
      },
    ],
    selected: {
      act: [],
      pass: [1],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};

export const ActiveAndDisabledPassive: Story = {
  args: {
    showActive: true,
    showPassive: true,
    disabledActive: false,
    disabledPassive: true,
    options: [
      {
        resno: 1,
        resname: "A",
        seq: "A",
        surface: true,
      },
      {
        resno: 2,
        resname: "T",
        seq: "T",
        surface: true,
      },
      {
        resno: 3,
        resname: "G",
        seq: "G",
        surface: true,
      },
      {
        resno: 4,
        resname: "C",
        seq: "C",
        surface: true,
      },
    ],
    selected: {
      act: [3],
      pass: [1, 4],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};

// Do not need ActiveDisabledAndPassive as that is not wanted

export const ActiveAndPassive: Story = {
  args: {
    showActive: true,
    showPassive: true,
    options: [
      {
        resno: 1,
        resname: "A",
        seq: "A",
        surface: true,
      },
      {
        resno: 2,
        resname: "T",
        seq: "T",
        surface: true,
      },
      {
        resno: 3,
        resname: "G",
        seq: "G",
        surface: true,
      },
      {
        resno: 4,
        resname: "C",
        seq: "C",
        surface: true,
      },
    ],
    selected: {
      act: [3],
      pass: [1],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};

export const LongList: Story = {
  args: {
    showActive: true,
    showPassive: true,
    options: Array.from({ length: 100 }, (_, i) => ({
      resno: i + 42,
      resname: "XXX",
      seq: "X",
      surface: true,
    })),
    selected: {
      act: [43, 111],
      pass: [51, 78],
      neighbours: [],
    },
    onChange: fn(),
    onHover: fn(),
    highlight: undefined,
  },
};
