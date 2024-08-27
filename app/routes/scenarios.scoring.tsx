import {
  array,
  InferOutput,
  instance,
  object,
  pipe,
  transform,
  union,
  ValiError,
} from "valibot";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { useActionData, useNavigate, useSubmit } from "@remix-run/react";

import { action as uploadaction } from "./upload";
import { mustBeAllowedToSubmit } from "~/auth.server";
import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "~/bartender-client/constants";
import JSZip from "jszip";
import { PDBFilesInput } from "~/scenarios/PDBFilesInput.client";
import { parseFormData } from "~/scenarios/schema";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { FormErrors } from "~/scenarios/FormErrors";
import { ClientOnly } from "~/components/ClientOnly";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  molecules: union([
    pipe(
      instance(File, "Must be a file"),
      transform((v) => [v]),
    ),
    array(instance(File, "Must be a file")),
  ]),
});
type Schema = InferOutput<typeof Schema>;

function generateWorkflow(data: Schema) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/scoring/capri-scoring-test.cfg
  // made valid for easy expertise level + added alascan

  const molecules = JSON.stringify(
    data.molecules.map((f) => f.name),
    undefined,
    2,
  );

  return `
# ===================================================================================
# CAPRI Scoring example
# ===================================================================================
# The Critical Assessment of PRedicted Interactions (CAPRI) experiment
#  aims to do test methods that model macromolecular interactions in
#  blind predictions based on the three-dimensional structures of proteins.
# For more information, please visit: https://www.ebi.ac.uk/pdbe/complex-pred/capri/
# ===================================================================================
run_dir = "${JOB_OUTPUT_DIR}"

# molecules to be scored (an ensemble PBD)
molecules = ${molecules}

# ===================================================================================
[topoaa]

[emscoring]

[clustfcc]
min_population = 2

[seletopclusts]
top_cluster = 1
top_models = 2

[mdscoring]

[clustfcc]
min_population = 2

[seletopclusts]

[caprieval]

[alascan]

# ===================================================================================
  `;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  for (const molecule of data.molecules) {
    zip.file(molecule.name, molecule);
  }

  return zip.generateAsync({ type: "blob" });
}

export default function ScoringScenario() {
  const actionData = useActionData<typeof uploadaction>();
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
      const workflow = generateWorkflow(data);
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
      <h1 className="text-3xl">Scoring scenario</h1>
      <p>
        Based on the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/examples/scoring/capri-scoring-test.cfg"
        >
          HADDOCK3 capri scoring example
        </a>
        .
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <label htmlFor="molecules">Molecules</label>
            <PDBFilesInput name="molecules" required />
            <FormErrors errors={errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
