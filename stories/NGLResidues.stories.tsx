import { Meta, StoryObj } from "@storybook/react";
import { StructureRepresentationType } from "ngl";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { NGLComponent, NGLResidues, NGLStage } from "~/scenarios/Viewer.client";

function ResiduesViewer(
  props: { structure: File } & Parameters<typeof NGLResidues>[0],
) {
  const { structure, ...residuesprops } = props;
  // File does not change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cacheStructure = useMemo(() => structure, []);
  const [representation, setRepresentation] =
    useState<StructureRepresentationType>("ball+stick");
  return (
    <div className="h-[500px] w-full">
      <NGLStage>
        <NGLComponent structure={cacheStructure} chain={"A"}>
          <NGLResidues {...residuesprops} representation={representation} />
        </NGLComponent>
      </NGLStage>
      <span>
        When switching representation the selected residues should remain
        selected.
      </span>
      <Button onClick={() => setRepresentation("ball+stick")}>
        ball+stick
      </Button>
      <Button onClick={() => setRepresentation("spacefill")}>spacefill</Button>
      <Button onClick={() => setRepresentation("licorice")}>licorice</Button>
    </div>
  );
}

const meta: Meta<typeof NGLResidues> = {
  component: NGLResidues,
  render: (args, { loaded: { structure } }) => (
    <ResiduesViewer {...args} structure={structure} />
  ),
};

export default meta;

type Story = StoryObj<typeof ResiduesViewer>;

const loaders = [
  async () => {
    const url = "/assets/2oob.pdb";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    const structure = new File([blob], url, { type: "text/plain" });
    return { structure };
  },
];

export const Default: Story = {
  loaders,
  args: {
    color: "white",
    residues: [932, 935, 936, 949, 950],
    representation: "ball+stick",
  },
};
