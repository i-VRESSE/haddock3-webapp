import { FormDescription } from "@i-vresse/haddock3-ui/toggles";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import JSZip from "jszip";
import { useState } from "react";
import { InferOutput, instance, object, optional, ValiError } from "valibot";

import { mustBeAllowedToSubmit } from "~/auth.server";
import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "~/bartender-client/constants";
import {
  Description,
  getModuleDescriptions,
} from "~/catalogs/descriptionsFromSchema";
import { ClientOnly } from "~/components/ClientOnly";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { FormErrors } from "~/scenarios/FormErrors";
import { PDBFilesInput } from "~/scenarios/PDBFilesInput.client";
import { ReferenceStructureInput } from "~/scenarios/ReferenceStructureInput";
import {
  moleculeFieldDescription,
  MoleculesSchema,
  parseFormData,
} from "~/scenarios/schema";
import { action as uploadaction } from "./upload";
import type { ExpertiseLevel } from "~/drizzle/schema.server";
import { useUser } from "~/auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const fieldDescriptions = {
  molecules: moleculeFieldDescription,
  ...getModuleDescriptions(`caprieval`, ["reference_fname"]),
} as {
  // TODO do fancy typescipt so cast is not needed
  molecules: Description;
  reference_fname: Description;
};

const Schema = object({
  molecules: MoleculesSchema,
  reference_fname: optional(instance(File, "Reference structure as PDB file")),
});
type Schema = InferOutput<typeof Schema>;

function generateWorkflow(
  data: Schema,
  preferredExpertiseLevel: ExpertiseLevel,
) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/refine-complex/refine-complex-test.cfg
  // made valid for easy expertise level + added alascan and contactmap

  const molecules = JSON.stringify(
    data.molecules.map((f) => f.name),
    undefined,
    2,
  );

  const ref_line = data.reference_fname
    ? `reference_fname = "${data.reference_fname.name}"`
    : "";

  // easy is not allowed to use tolerance or sampling_factor
  const tolerance_line =
    preferredExpertiseLevel === "easy" ? "" : "tolerance = 10";
  const tolerance_line_md =
    preferredExpertiseLevel === "easy" ? "" : "tolerance = 5";
  const sampling_factor =
    preferredExpertiseLevel === "easy" ? "" : "sampling_factor = 10";

  // mdref parameters used in template are not available to easy expertise level
  // so we do not make them configurable by the user
  return `
# ====================================================================
# Refinment of a complex example
run_dir = "${JOB_OUTPUT_DIR}"

# molecules to be scored (an ensemble PBD)
molecules = ${molecules}

# ===================================================================================
[topoaa]
${tolerance_line}

[mdref]
${tolerance_line_md}
${sampling_factor}

[caprieval]
${ref_line}

[alascan]

[contactmap]
# ===================================================================================
    `;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  for (const molecule of data.molecules) {
    zip.file(molecule.name, molecule);
  }
  if (data.reference_fname) {
    zip.file(data.reference_fname.name, data.reference_fname);
  }

  return zip.generateAsync({ type: "blob" });
}

export default function RefinementScenario() {
  const actionData = useActionData<typeof uploadaction>();
  const { preferredExpertiseLevel } = useUser();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<string[] | undefined>(
    actionData?.errors,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const data = parseFormData(formData, Schema);
      setErrors(undefined);
      const workflow = generateWorkflow(data, preferredExpertiseLevel!);
      const zipPromise = createZip(workflow, data);
      handleActionButton(event.nativeEvent, zipPromise, navigate, submit);
    } catch (e) {
      if (e instanceof ValiError) {
        return setErrors(e.issues.map((i) => i.message));
      }
      setErrors([String(e)]);
    }
  }

  return (
    <>
      <h1 className="text-3xl">Refinement scenario</h1>
      <p className="py-2">
        Based on the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/refine-complex/refine-complex-test.cfg"
        >
          HADDOCK3 Molecular Dynamics refinement example
        </a>
        .
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="py-2">
              <label htmlFor="molecules">Molecules</label>
              <FormDescription>
                {fieldDescriptions.molecules.longDescription}
                In the example e2a-hpr_1GGR_A.pdb and e2a-hpr_1GGR_B.pdb.
              </FormDescription>
              <PDBFilesInput name="molecules" required />
            </div>
            <ReferenceStructureInput>
              In example named data/ee2a-hpr_1GGR.pdb
            </ReferenceStructureInput>
            <FormErrors errors={errors ?? actionData?.errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
