import type { Meta, StoryObj } from "@storybook/react";
import { fn, within } from "@storybook/test";

import { MoleculeSubForm } from "../app/scenarios/MoleculeSubForm.client";

const meta: Meta<typeof MoleculeSubForm> = {
  component: MoleculeSubForm,
};

export default meta;

type Story = StoryObj<typeof MoleculeSubForm>;

export const Surface: Story = {
  args: {
    name: "protein1",
    legend: "Protein 1",
    description: "Protein 1 description",
    actpass: {
      active: [],
      passive: [],
      neighbours: [],
      chain: "A",
      bodyRestraints: "",
    },
    onActPassChange: fn(),
    targetChain: "A",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileInput: HTMLInputElement = canvas.getByLabelText("Structure", {
      selector: "input",
    });

    await loadFileIntoInput("/assets/2oob.pdb", fileInput);
  },
};

async function loadFileIntoInput(url: string, fileInput: HTMLInputElement) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const blob = await response.blob();
  const file = new File([blob], url, { type: "text/plain" });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
}
