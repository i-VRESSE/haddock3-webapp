import { FormDescription } from "@i-vresse/haddock3-ui/toggles";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import JSZip from "jszip";
import { useState } from "react";
import {
  InferOutput,
  integer,
  maxValue,
  minValue,
  object,
  pipe,
  string,
  transform,
  ValiError,
} from "valibot";

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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { FormErrors } from "~/scenarios/FormErrors";
import { PDBFilesInput } from "~/scenarios/PDBFilesInput.client";
import {
  moleculeFieldDescription,
  MoleculesSchema,
  parseFormData,
} from "~/scenarios/schema";
import { action as uploadaction } from "./upload";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const fieldDescriptions = {
  molecules: moleculeFieldDescription,
  ...getModuleDescriptions(`clustfcc`, ["clust_cutoff", "min_population"]),
  ...getModuleDescriptions(`seletopclusts`, ["top_models", "top_cluster"]),
} as {
  // TODO do fancy typescipt so cast is not needed
  molecules: Description;
  clust_cutoff: Description;
  min_population: Description;
  top_cluster: Description;
  top_models: Description;
};

// TODO limit file size and total file size
// worked with check((f) => f.size <=1e9, 'too big')
// but returned incorrect error message
// now server will give
// Error: Field "upload" exceeded upload size of 1000000000 bytes.
const Schema = object({
  molecules: MoleculesSchema,
  min_population: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(fieldDescriptions.min_population.minimum),
    maxValue(fieldDescriptions.min_population.maximum),
  ),
  clust_cutoff: pipe(
    string(),
    transform(Number),
    minValue(fieldDescriptions.clust_cutoff.minimum),
    maxValue(fieldDescriptions.clust_cutoff.maximum),
  ),
  top_cluster: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(fieldDescriptions.top_cluster.minimum),
    maxValue(fieldDescriptions.top_cluster.maximum),
  ),
  top_models: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(fieldDescriptions.top_models.minimum),
    maxValue(fieldDescriptions.top_models.maximum),
  ),
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
tolerance = 10

[emscoring]
tolerance = 10

[caprieval]

[clustfcc]
min_population = ${data.min_population}
clust_cutoff = ${data.clust_cutoff}

[seletopclusts]
top_models = ${data.top_models}
top_cluster = ${data.top_cluster}

[caprieval]
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
      <p className="py-2">
        Based on the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/scoring/capri-scoring-test.cfg"
        >
          HADDOCK3 capri scoring example
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
              </FormDescription>
              <PDBFilesInput name="molecules" required />
            </div>
            <details className="flex flex-col gap-2">
              <summary>Advanced options</summary>
              <div>
                <Label htmlFor="min_population">
                  {fieldDescriptions.min_population.title}
                </Label>
                <FormDescription>
                  {fieldDescriptions.min_population.longDescription}
                </FormDescription>
                <Input
                  type="number"
                  name="min_population"
                  id="min_population"
                  required
                  max={fieldDescriptions.min_population.maximum}
                  min={fieldDescriptions.min_population.minimum}
                  defaultValue={fieldDescriptions.min_population.default}
                />
              </div>
              <div>
                <Label htmlFor="clust_cutoff">
                  {fieldDescriptions.clust_cutoff.title}
                </Label>
                <FormDescription>
                  {fieldDescriptions.clust_cutoff.longDescription}
                </FormDescription>
                <Input
                  type="text"
                  name="clust_cutoff"
                  id="clust_cutoff"
                  required
                  max={fieldDescriptions.clust_cutoff.maximum}
                  min={fieldDescriptions.clust_cutoff.minimum}
                  defaultValue={fieldDescriptions.clust_cutoff.default}
                />
              </div>
              <div>
                <Label htmlFor="top_cluster">
                  {fieldDescriptions.top_cluster.title}
                </Label>
                <FormDescription>
                  {fieldDescriptions.top_cluster.longDescription}
                </FormDescription>
                <Input
                  type="number"
                  name="top_cluster"
                  id="top_cluster"
                  required
                  max={fieldDescriptions.top_cluster.maximum}
                  min={fieldDescriptions.top_cluster.minimum}
                  defaultValue={fieldDescriptions.top_cluster.default}
                />
              </div>
              <div>
                <Label htmlFor="top_models">
                  {fieldDescriptions.top_models.title}
                </Label>
                <FormDescription>
                  {fieldDescriptions.top_models.longDescription}
                </FormDescription>
                <Input
                  type="number"
                  name="top_models"
                  id="top_models"
                  required
                  max={fieldDescriptions.top_models.maximum}
                  min={fieldDescriptions.top_models.minimum}
                  defaultValue={fieldDescriptions.top_models.default}
                />
              </div>
            </details>
            <FormErrors errors={errors ?? actionData?.errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
