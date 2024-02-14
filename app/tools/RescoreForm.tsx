import { Form, Link, useNavigation } from "@remix-run/react";
import type { FlatErrors } from "valibot";

import { ToolHistory } from "./ToolHistory";
import type { Weights } from "../caprieval/caprieval.server";
import { getModuleDescriptions } from "~/catalogs/descriptionsFromSchema";
import { ErrorMessages } from "../components/ErrorMessages";
import { ReWarning } from "./ReWarning";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

// w_* props are not defined in caprieval modile, but in scoring and refinement modules
const moduleDescriptions = getModuleDescriptions("mdref", [
  "w_elec",
  "w_vdw",
  "w_desolv",
  "w_bsa",
  "w_air",
]);

export function RescoreForm({
  weights,
  errors,
  showInteractiveVersion,
  hasInteractiveVersion,
  moduleIndex,
}: {
  weights: Weights;
  errors: FlatErrors | undefined;
  showInteractiveVersion: boolean;
  hasInteractiveVersion: boolean;
  moduleIndex: number;
}) {
  const { state } = useNavigation();
  return (
    <Form method="post" action="?">
      <h2 className="text-2xl">Rescore of module {moduleIndex}</h2>
      <ReWarning title="Rescoring" />
      <div className="flex flex-row gap-4">
        {/* key is used to force React to re-render the component
          when the weights changes */}
        <div key={"w_elec" + weights.w_elec}>
          <Label
            htmlFor="w_elec"
            className="block"
            title={moduleDescriptions.w_elec.longDescription}
          >
            {moduleDescriptions.w_elec.title}
          </Label>
          <Input
            type="text"
            name="w_elec"
            id="w_elec"
            defaultValue={weights.w_elec}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_elec" errors={errors} />
        </div>
        <div key={"w_vdw" + weights.w_vdw}>
          <Label
            htmlFor="w_vdw"
            className="block"
            title={moduleDescriptions.w_vdw.longDescription}
          >
            {moduleDescriptions.w_vdw.title}
          </Label>
          <Input
            type="text"
            name="w_vdw"
            id="w_vdw"
            defaultValue={weights.w_vdw}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_vdw" errors={errors} />
        </div>
        <div key={"w_desolv" + weights.w_desolv}>
          <Label
            htmlFor="w_desolv"
            className="block"
            title={moduleDescriptions.w_desolv.longDescription}
          >
            {moduleDescriptions.w_desolv.title}
          </Label>
          <Input
            type="text"
            name="w_desolv"
            id="w_desolv"
            className="rounded border-2 p-1"
            defaultValue={weights.w_desolv}
          />
          <ErrorMessages path="w_desolv" errors={errors} />
        </div>
        <div key={"w_bsa" + weights.w_bsa}>
          <Label
            htmlFor="w_bsa"
            className="block"
            title={moduleDescriptions.w_bsa.longDescription}
          >
            {moduleDescriptions.w_bsa.title}
          </Label>
          <Input
            type="text"
            name="w_bsa"
            id="w_bsa"
            defaultValue={weights.w_bsa}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_bsa" errors={errors} />
        </div>
        <div key={"w_air" + weights.w_air}>
          <Label
            htmlFor="w_air"
            className="block"
            title={moduleDescriptions.w_air.longDescription}
          >
            {moduleDescriptions.w_air.title}
          </Label>
          <Input
            type="text"
            name="w_air"
            id="w_air"
            defaultValue={weights.w_air}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_air" errors={errors} />
        </div>
      </div>
      <div className="flex flex-row gap-2 p-2">
        <Button type="submit" disabled={state !== "idle"}>
          {state === "submitting" ? "Running..." : "Rescore"}
        </Button>
        <Button asChild variant="outline">
          <Link to="../../.." relative="path">
            Back
          </Link>
        </Button>
      </div>
      <ToolHistory
        showInteractiveVersion={showInteractiveVersion}
        hasInteractiveVersion={hasInteractiveVersion}
      />
    </Form>
  );
}
