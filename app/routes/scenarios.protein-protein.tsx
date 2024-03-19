import { useActionData, useSubmit, useNavigate } from "@remix-run/react";
import { action as uploadaction } from "./upload";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { object, instance, Output } from "valibot";
import { parseFormData } from "~/scenarios/schema";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import JSZip from "jszip";
import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { PDBFileInput } from "~/scenarios/PDBFileInput";
import { Input } from "~/components/ui/input";

export const action = uploadaction;

const Schema = object({
  protein1: instance(File, "First protein structure as PDB file"),
  protein2: instance(File, "Second protein structure as PDB file"),
  ambig_fname: instance(File, "Ambiguous restraints as TBL file"),
  reference_fname: instance(File, "Reference structure as PDB file"),
});
type Schema = Output<typeof Schema>;

function generateWorkflow(data: Schema) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-protein/docking-protein-protein-full.cfg
  // changed to autohis=true
  return `
# ====================================================================
# Protein-protein docking example with NMR-derived ambiguous interaction restraints

# directory in which the scoring will be done
run_dir = "run1-full"

# execution mode
mode = "batch"
#  it will take the system's default
# queue = "short"
# concatenate models inside each job, concat = 5 each .job will produce 5 models
concat = 5
#  Limit the number of concurrent submissions to the queue
queue_limit = 100

# molecules to be docked
molecules =  [
    "${data.protein1.name}",
    "${data.protein2.name}"
    ]

# ====================================================================
# Parameters for each stage are defined below, prefer full paths
# ====================================================================
[topoaa]

[rigidbody]
tolerance = 5
ambig_fname = "${data.ambig_fname.name}"
sampling = 1000

[caprieval]
reference_fname = "${data.reference_fname.name}"

[seletop]
select = 200

[caprieval]
reference_fname = "${data.reference_fname.name}"

[flexref]
tolerance = 5
ambig_fname = "${data.ambig_fname.name}"

[caprieval]
reference_fname = "${data.reference_fname.name}"

[emref]
tolerance = 5
ambig_fname = "${data.ambig_fname.name}"

[caprieval]
reference_fname = "${data.reference_fname.name}"

[clustfcc]

[seletopclusts]
top_models = 4

[caprieval]
reference_fname = "${data.reference_fname.name}"

# ====================================================================


    `;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.protein1.name, data.protein1);
  zip.file(data.protein2.name, data.protein2);
  zip.file(data.ambig_fname.name, data.ambig_fname);
  zip.file(data.reference_fname.name, data.reference_fname);
  return zip.generateAsync({ type: "blob" });
}

export default function ProteinProteinScenario() {
  const actionData = useActionData<typeof uploadaction>();
  const submit = useSubmit();
  const navigate = useNavigate();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = parseFormData(formData, Schema);
    const workflow = generateWorkflow(data);
    const zipPromise = createZip(workflow, data);
    handleActionButton(event.nativeEvent, zipPromise, navigate, submit);
  }

  return (
    <>
      <h1 className="text-3xl">Protein-protein docking scenario</h1>
      <p>
        Based on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://www.bonvinlab.org/education/HADDOCK24/HADDOCK24-protein-protein-basic/"
        >
          HADDOCK2.4 Protein-protein docking tutorial
        </a>{" "}
        and the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-protein/docking-protein-protein-full.cfg"
        >
          HADDOCK3 example
        </a>
        .
      </p>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <FormItem name="protein1" label="First protein structure">
            <PDBFileInput name="protein1" required />
            <FormDescription>
              In example named data/e2aP_1F3G.pdb
            </FormDescription>
          </FormItem>
          <FormItem name="protein2" label="Second protein structure">
            <PDBFileInput name="protein2" required />
            <FormDescription>
              In example named data/hpr_ensemble.pdb
            </FormDescription>
          </FormItem>
          <FormItem name="ambig_fname" label="Ambiguous restraints">
            <Input
              type="file"
              id="ambig_fname"
              name="ambig_fname"
              required
              accept=".tbl"
            />
            <FormDescription>
              In example named data/e2a-hpr_air.tbl
            </FormDescription>
          </FormItem>
          <FormItem name="reference_fname" label="Reference structure">
            <PDBFileInput name="reference_fname" />
            <FormDescription>
              In example named data/e2a-hpr_1GGR.pdb
            </FormDescription>
          </FormItem>
        </div>
        <div className="py-2 text-red-500">
          {actionData?.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
        <ActionButtons />
      </form>
    </>
  );
}
