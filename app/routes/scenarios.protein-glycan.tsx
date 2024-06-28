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
  protein: instance(File, "Protein structure as PDB file"),
  glycan: instance(File, "Glycan structure as PDB file"),
  nrSelectedProteinResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the protein."),
  ),
  nrSelectedGlycanResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the glycan."),
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
  // https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-protein/docking-protein-protein-full.cfg
  // made valid for easy expertise level

  const unambig_line = data.unambig_fname
    ? `unambig_fname = "${data.unambig_fname.name}"`
    : "";
  const ref_line = data.reference_fname
    ? `reference_fname = "${data.reference_fname.name}"`
    : "";
  return `
# ==================================================
#      Protein-glycan docking with HADDOCK3
#
# ==================================================

run_dir = "run1-full"

# execution mode
# for running locally uncomment the next two lines 
# and comment the lines under the HPC execution
#mode = "local"
#ncores = 40

# BATCH/HPC EXECUTION
mode = "batch"
# concatenate models inside each job
concat = 5
#  Limit the number of concurrent submissions to the queue
queue_limit = 100

# molecules to be docked
molecules = [
    "${data.protein.name}",
    "${data.glycan.name}",
    ] 

# ==================================================
[topoaa] 

[rigidbody]
tolerance = 5
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
sampling = 1000
w_vdw = 1 

[caprieval]
${ref_line}

# rigidbody models containing glycans can be very similar to each other
# especially when the glycans are short and linear. RMSD clustering after
# rigidbody is useful to remove redundant models
[ilrmsdmatrix]

[clustrmsd]
criterion = 'maxclust'
n_clusters = 50 # the number of clusters to be formed

[seletopclusts]
top_models = 5

[caprieval]
${ref_line}

[flexref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
tolerance = 5 

[caprieval]
${ref_line}

[ilrmsdmatrix]

[clustrmsd]
criterion = 'distance'
linkage = 'average'
# full example, 4 models should be present in a cluster
min_population = 4
clust_cutoff = 2.5 

[seletopclusts]
top_models = 4

[caprieval]
${ref_line}

# Running final caprieval with allatoms parameter set to true to also
#  include the evaluation of protein side chains
#  in both the alignment process and irmsd, ilrmsd computations
# NOTE that all glycans atoms are always considered even without this option.
[caprieval]
allatoms = true
${ref_line}

# ==================================================
`;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.protein.name, data.protein);
  zip.file(data.glycan.name, data.glycan);
  zip.file(data.ambig_fname.name, data.ambig_fname);
  if (data.reference_fname) {
    zip.file(data.reference_fname.name, data.reference_fname);
  }
  if (data.unambig_fname) {
    zip.file(data.unambig_fname.name, data.unambig_fname);
  }
  return zip.generateAsync({ type: "blob" });
}

export default function ProteinProteinScenario() {
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
  const [glycanActPass, setGlycanActPass] = useState<ActPassSelection>({
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
    formData.set("nrSelectedGlycanResidues", countSelected(glycanActPass));

    const ambig_fname = await generateAmbiguousRestraintsFile(
      proteinActPass,
      glycanActPass,
    );
    formData.set("ambig_fname", ambig_fname);

    const unambig_fname = generateUnAmbiguousRestraintsFile(
      proteinActPass.bodyRestraints,
      glycanActPass.bodyRestraints,
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
      <h1 className="text-3xl">Protein-glycan docking scenario</h1>
      <p>
        Based on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-glycan/docking-protein-glycan-full.cfg"
        >
          HADDOCK3 Protein-glycan example
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
                description="In example named data/1LMQ_r_u.pdb"
                actpass={proteinActPass}
                onActPassChange={setProteinActPass}
                targetChain="A"
              />
              {/* TODO treat glycan as glycan, 
              disable surface calculation (example fails calc),
              only active as restraints flavour kind,
              render as ball+stick  */}
              {/* TODO molstar has carbohydrate representation, check if there is equiv in ngl */}
              <MoleculeSubForm
                name="glycan"
                legend="Glycan"
                description="In example named data/1LMQ_l_u.pdb"
                actpass={glycanActPass}
                onActPassChange={setGlycanActPass}
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
