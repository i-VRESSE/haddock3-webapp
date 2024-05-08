import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useMemo } from "react";
import { NGLComponent, NGLStage, NGLSurface } from "~/scenarios/Viewer.client";

function SurfaceViewer(
  props: { structure: File } & Parameters<typeof NGLSurface>[0],
) {
  const { structure, ...surfaceprops } = props;
  // File does not change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cacheStructure = useMemo(() => structure, []);
  return (
    <div className="h-[500px] w-full">
      <NGLStage>
        <NGLComponent structure={cacheStructure} chain={"A"}>
          <NGLSurface {...surfaceprops} />
        </NGLComponent>
      </NGLStage>
      <ul>
        <li>Active: {surfaceprops.activeColor}</li>
        <li>Passive: {surfaceprops.passiveColor}</li>
        <li>Neighbours: {surfaceprops.neighboursColor}</li>
        <li>Default: {surfaceprops.defaultColor}</li>
        <li>Highlight: {surfaceprops.highlightColor}</li>
      </ul>
    </div>
  );
}

const meta: Meta<typeof SurfaceViewer> = {
  component: SurfaceViewer,
  render: (args, { loaded: { structure } }) => (
    <SurfaceViewer {...args} structure={structure} />
  ),
};

export default meta;

type Story = StoryObj<typeof SurfaceViewer>;

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

export const NoSelection: Story = {
  loaders,
  args: {
    active: [],
  },
};

export const WithSelection: Story = {
  loaders,
  args: {
    active: [932, 935, 936, 949, 950, 952, 958],
    activeColor: "green",
    passive: [970],
    neighbours: [971, 972],
    passiveColor: "yellow",
    neighboursColor: "orange",
    defaultColor: "white",
  },
};

export const WithHighlight: Story = {
  loaders,
  args: {
    active: [932, 935, 936, 949, 950, 952, 958],
    activeColor: "green",
    passive: [970],
    neighbours: [971, 972],
    passiveColor: "yellow",
    neighboursColor: "orange",
    defaultColor: "white",
    highlight: 971,
    highlightColor: "red",
  },
};

export const Pickable: Story = {
  loaders,
  args: {
    active: [932, 935, 936, 949, 950, 952, 958],
    activeColor: "green",
    passive: [970],
    neighbours: [971, 972],
    passiveColor: "yellow",
    neighboursColor: "orange",
    defaultColor: "white",
    pickable: true,
    onPick: fn(),
  },
};

export const WithHover: Story = {
  loaders,
  args: {
    active: [932, 935, 936, 949, 950, 952, 958],
    activeColor: "green",
    passive: [970],
    neighbours: [971, 972],
    passiveColor: "yellow",
    neighboursColor: "orange",
    defaultColor: "white",
    pickable: true,
    onHover: fn(),
  },
};
