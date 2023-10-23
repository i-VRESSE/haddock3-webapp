import { Form } from "@remix-run/react";
import type { FlatErrors } from "valibot";

import { ErrorMessages } from "~/components/ErrorMessages";
import { ToolHistory } from "../components/ToolHistory";
import type { Weights } from "./rescore.server";

export function RescoreForm({
  weights,
  errors,
  interactivness,
  maxInteractivness,
}: {
  weights: Weights;
  errors: FlatErrors | undefined;
  interactivness: number;
  maxInteractivness: number;
}) {
  return (
    <Form method="post" action="?">
      <h2 className="text-2xl">Rescore</h2>
      <div className="flex flex-row gap-4">
        {/* key is used to force React to re-render the component
          when the weights changes */}
        <div key={"w_elec" + weights.w_elec}>
          <label htmlFor="w_elec" className="block">
            Weight of the electrostatic component
          </label>
          <input
            type="text"
            name="w_elec"
            id="w_elec"
            defaultValue={weights.w_elec}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_elec" errors={errors} />
        </div>
        <div key={"w_vdw" + weights.w_vdw}>
          <label htmlFor="w_vdw" className="block">
            Weight of the van der Waals component
          </label>
          <input
            type="text"
            name="w_vdw"
            id="w_vdw"
            defaultValue={weights.w_vdw}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_vdw" errors={errors} />
        </div>
        <div key={"w_desolv" + weights.w_desolv}>
          <label htmlFor="w_desolv" className="block">
            Weight of the desolvation component
          </label>
          <input
            type="text"
            name="w_desolv"
            id="w_desolv"
            className="rounded border-2 p-1"
            defaultValue={weights.w_desolv}
          />
          <ErrorMessages path="w_desolv" errors={errors} />
        </div>
        <div key={"w_bsa" + weights.w_bsa}>
          <label htmlFor="w_bsa" className="block">
            Weight of the BSA component
          </label>
          <input
            type="text"
            name="w_bsa"
            id="w_bsa"
            defaultValue={weights.w_bsa}
            className="rounded border-2 p-1"
          />
          <ErrorMessages path="w_bsa" errors={errors} />
        </div>
        <div key={"w_air" + weights.w_air}>
          <label htmlFor="w_air" className="block">
            Weight of the AIR component
          </label>
          <input
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
        <button type="submit" className="btn btn-primary btn-sm">
          Rescore
        </button>
        {/* 
          TODO show history, and allow to switch to old result 
          Reset button is not possible, due to write-once job dir
          */}
        <a href=".." className=" btn-outline btn btn-sm">
          Back
        </a>
      </div>
      <ToolHistory
        interactivness={interactivness}
        maxInteractivness={maxInteractivness}
      />
    </Form>
  );
}
