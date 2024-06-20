import { useState } from "react";
import { useActionData, useSubmit, useNavigate, json } from "@remix-run/react";
import {
  object,
  instance,
  InferOutput,
  optional,
  minSize,
  ValiError,
  pipe,
  integer,
  minValue,
  string,
  transform,
} from "valibot";
import JSZip from "jszip";
import { LoaderFunctionArgs } from "@remix-run/node";

import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { parseFormData } from "~/scenarios/schema";
import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { PDBFileInput } from "~/scenarios/PDBFileInput.client";
import { action as uploadaction } from "./upload";
import { MoleculeSubForm } from "~/scenarios/MoleculeSubForm.client";
import { ActPassSelection, countSelected } from "~/scenarios/ActPassSelection";
import { ClientOnly } from "~/components/ClientOnly";
import { mustBeAllowedToSubmit } from "~/auth.server";
import {
  generateAmbiguousRestraintsFile,
  generateUnAmbiguousRestraintsFile,
} from "../scenarios/restraints";
import { FormErrors } from "../scenarios/FormErrors";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  // TODO check content of pdb files are valid
  protein: instance(File, "Protein structure as PDB file"),
  dna: instance(File, "DNA structure as PDB file"),
  nrSelectedProteinResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the protein."),
  ),
  nrSelectedDNAResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the DNA."),
  ),
  ambig_fname: pipe(
    instance(File, "Ambiguous restraints as TBL file"),
    minSize(
      1,
      "Ambiguous restraints file should not be empty. Please select residues.",
    ),
  ),
  unambig_fname: optional(instance(File, "Unambiguous restraints as TBL file")),
  reference_fname: optional(instance(File, "Reference structure as PDB file")),
});
type Schema = InferOutput<typeof Schema>;

function generateWorkflow(data: Schema) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-DNA/docking-protein-DNA-full.cfg
  // made valid for easy expertise level

  const unambig_line = data.unambig_fname
    ? `unambig_fname = "${data.unambig_fname.name}"`
    : "";
  const ref_line = data.reference_fname
    ? `reference_fname = "${data.reference_fname.name}"`
    : "";
  return `
    # ====================================================================
# protein-DNA docking example

# directory in which the scoring will be done
run_dir = "run1-full"

# execution mode
mode = "batch"
# in which queue the jobs should run, if nothing is defined
#  it will take the system's default
# queue = "short"
# concatenate models inside each job, concat = 5 each .job will produce 5 models
concat = 5
#  Limit the number of concurrent submissions to the queue
queue_limit = 100

# molecules to be docked
molecules =  [
    "${data.protein.name}",
    "${data.dna.name}"
    ]

# ====================================================================
# Parameters for each stage are defined below, prefer full paths
# ====================================================================
[topoaa]

[rigidbody]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
sampling = 1000

[caprieval]
${ref_line}

[seletop]
select = 200

[caprieval]
${ref_line}

[flexref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
dnarest_on = true

[caprieval]
${ref_line}

[emref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
dnarest_on = true

[caprieval]
${ref_line}

[clustfcc]

[seletopclusts]
top_models = 4

[caprieval]
${ref_line}

# Running final caprieval with allatoms parameter set to true to also
#  include the evaluation of protein side chains and DNA nucleotides
#  in both the alignment process and lrmsd, irmsd, ilrmsd computations
[caprieval]
allatoms = true
${ref_line}

[contactmap]

# ====================================================================
    `;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.protein.name, data.protein);
  zip.file(data.dna.name, data.dna);
  zip.file(data.ambig_fname.name, data.ambig_fname);
  if (data.reference_fname) {
    zip.file(data.reference_fname.name, data.reference_fname);
  }
  if (data.unambig_fname) {
    zip.file(data.unambig_fname.name, data.unambig_fname);
  }
  return zip.generateAsync({ type: "blob" });
}

export default function Page() {
  const actionData = useActionData<typeof uploadaction>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [proteinActPass, setProteinActPass] = useState<ActPassSelection>({
    active: [],
    passive: [],
    neighbours: [],
    chain: "",
    bodyRestraints: "",
  });
  const [dnaActPass, setDnaActPass] = useState<ActPassSelection>({
    active: [],
    passive: [],
    neighbours: [],
    chain: "",
    bodyRestraints: "",
  });
  const [errors, setErrors] = useState<string[] | undefined>(
    actionData?.errors,
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("nrSelectedProteinResidues", countSelected(proteinActPass));
    formData.set("nrSelectedDNAResidues", countSelected(dnaActPass));

    const ambig_fname = await generateAmbiguousRestraintsFile(
      proteinActPass,
      dnaActPass,
    );
    formData.set("ambig_fname", ambig_fname);

    const unambig_fname = generateUnAmbiguousRestraintsFile(
      proteinActPass.bodyRestraints,
      dnaActPass.bodyRestraints,
    );
    if (unambig_fname) {
      formData.set("unambig_fname", unambig_fname);
    }

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
      <h1 className="text-3xl">Protein-DNA docking scenario</h1>
      <p>
        Based on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://www.bonvinlab.org/education/HADDOCK24/HADDOCK24-protein-DNA-basic/"
        >
          HADDOCK2.4 Protein-dna docking basic tutorial
        </a>{" "}
        and the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-DNA/docking-protein-DNA-full.cfg"
        >
          HADDOCK3 example
        </a>
        .
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <MoleculeSubForm
                name="protein"
                legend="Protein"
                description="In example named data/cro.pdb or 3CRO_complex.pdb"
                actpass={proteinActPass}
                onActPassChange={setProteinActPass}
                targetChain="A"
              />
              <MoleculeSubForm
                name="dna"
                legend="DNA"
                description="In example named data/dna.pdb or OR1_unbound.pdb"
                actpass={dnaActPass}
                onActPassChange={setDnaActPass}
                targetChain="B"
              />
            </div>
            <FormItem name="reference_fname" label="Reference structure">
              <PDBFileInput name="reference_fname" />
              <FormDescription>
                In example named data/target.pdb
              </FormDescription>
            </FormItem>
            <FormErrors errors={errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
