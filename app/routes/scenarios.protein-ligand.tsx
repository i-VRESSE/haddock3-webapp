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
  string,
  integer,
  minValue,
  transform,
} from "valibot";
import JSZip from "jszip";
import { LoaderFunctionArgs } from "@remix-run/node";

import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "~/bartender-client/constants";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { parseFormData } from "~/scenarios/schema";
import { action as uploadaction } from "./upload";
import { ActPassSelection, countSelected } from "~/scenarios/ActPassSelection";
import { ClientOnly } from "~/components/ClientOnly";
import { mustBeAllowedToSubmit } from "~/auth.server";
import {
  generateAmbiguousRestraintsFile,
  generateUnAmbiguousRestraintsFile,
} from "../scenarios/restraints";
import { FormErrors } from "../scenarios/FormErrors";
import { HeteroMoleculeSubForm } from "~/scenarios/HeteroMoleculeSubForm.client";
import { BindingMoleculeSubForm } from "~/scenarios/BindingMoleculeSubForm.client";
import { ReferenceStructureInput } from "~/scenarios/ReferenceStructureInput";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  protein: instance(File, "Need a protein structure as PDB file"),
  ligand: instance(File, "Need a ligand structure as PDB file"),
  nrSelectedProteinResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the protein."),
  ),
  nrSelectedLigandResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the ligand."),
  ),
  ambig_actpass_fname: pipe(
    instance(File, "Need a ambiguous active+passive restraints as TBL file"),
    minSize(
      1,
      "Ambiguous restraints file should not be empty. Please select residues.",
    ),
  ),
  ambig_pass_fname: pipe(
    instance(File, "Need a ambiguous passive restraints as TBL file"),
    minSize(
      1,
      "Ambiguous restraints file should not be empty. Please select residues.",
    ),
  ),
  ligand_param_fname: instance(File, "Need a custom ligand parameter file"),
  ligand_top_fname: instance(File, "Need a custom ligand topology file"),
  unambig_fname: optional(instance(File, "Unambiguous restraints as TBL file")),
  reference_fname: optional(instance(File, "Reference structure as PDB file")),
});
type Schema = InferOutput<typeof Schema>;

function generateWorkflow(data: Schema) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-ligand/docking-protein-ligand-full.cfg
  // made valid for easy expertise level

  const ref_line = data.reference_fname
    ? `reference_fname = "${data.reference_fname.name}"`
    : "";

  const param_line = data.ligand_param_fname
    ? `ligand_param_fname = "${data.ligand_param_fname.name}"`
    : "";
  const top_line = data.ligand_top_fname
    ? `ligand_top_fname = "${data.ligand_top_fname.name}"`
    : "";

  return `
# ====================================================================
# Protein-ligand docking example

# directory in which the scoring will be done
run_dir = "${JOB_OUTPUT_DIR}"

# molecules to be docked
molecules =  [
    "${data.protein.name}",
    "${data.ligand.name}"
    ]

# ====================================================================
[topoaa]
${param_line}
${top_line}
delenph = false

[rigidbody]
ambig_fname = "${data.ambig_actpass_fname.name}"
${param_line}
${top_line}
sampling = 1000
w_vdw = 1.0

[caprieval]
${ref_line}

[seletop]
select = 200

[caprieval]
${ref_line}

[flexref]
ambig_fname = "${data.ambig_pass_fname.name}"
${param_line}
${top_line}
mdsteps_rigid = 0
mdsteps_cool1 = 0

[caprieval]
${ref_line}

[ilrmsdmatrix]

[clustrmsd]
criterion = 'distance'
clust_cutoff = 2.5
plot_matrix = true

[seletopclusts]
top_models = 4

[caprieval]
${ref_line}

# Running final caprieval with allatoms parameter set to true to also
#  include the evaluation of protein side chains
#  in both the alignment process and irmsd, ilrmsd computations
# NOTE that all ligand atoms are always considered even without this option.
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
  zip.file(data.ligand.name, data.ligand);
  zip.file(data.ambig_actpass_fname.name, data.ambig_actpass_fname);
  zip.file(data.ambig_pass_fname.name, data.ambig_pass_fname);
  if (data.reference_fname) {
    zip.file(data.reference_fname.name, data.reference_fname);
  }
  if (data.unambig_fname) {
    zip.file(data.unambig_fname.name, data.unambig_fname);
  }
  if (data.ligand_param_fname) {
    zip.file(data.ligand_param_fname.name, data.ligand_param_fname);
  }
  if (data.ligand_top_fname) {
    zip.file(data.ligand_top_fname.name, data.ligand_top_fname);
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
  const [ligandActPass, setLigandActPass] = useState<ActPassSelection>({
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
    formData.set("nrSelectedLigandResidues", countSelected(ligandActPass));

    const ambig_actpass_fname = await generateAmbiguousRestraintsFile(
      {
        active: proteinActPass.active,
        passive: [],
        neighbours: [],
        chain: proteinActPass.chain,
        bodyRestraints: proteinActPass.bodyRestraints,
      },
      ligandActPass,
    );
    formData.set("ambig_actpass_fname", ambig_actpass_fname);

    const ambig_pass_fname = await generateAmbiguousRestraintsFile(
      {
        active: [],
        passive: proteinActPass.active,
        neighbours: [],
        chain: proteinActPass.chain,
        bodyRestraints: proteinActPass.bodyRestraints,
      },
      ligandActPass,
    );
    formData.set("ambig_pass_fname", ambig_pass_fname);

    const unambig_fname = generateUnAmbiguousRestraintsFile(
      proteinActPass.bodyRestraints,
      ligandActPass.bodyRestraints,
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
      <h1 className="text-3xl">Protein-Ligand docking scenario</h1>
      <p>
        Based on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://www.bonvinlab.org/education/HADDOCK24/HADDOCK24-binding-sites"
        >
          HADDOCK2.4 Small molecule binding site screening
        </a>{" "}
        and the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-ligand/docking-protein-ligand-full.cfg"
        >
          HADDOCK3 example
        </a>
        .
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <BindingMoleculeSubForm
                name="protein"
                legend="Protein"
                description="In example named 2J8S-renumbered.pdb"
                actpass={proteinActPass}
                onActPassChange={setProteinActPass}
                targetChain="A"
                preprocessPipeline="delhetatmkeepcoord"
              />
              <HeteroMoleculeSubForm
                name="ligand"
                legend="Ligand"
                description="In example named rifampicin.pdb"
                actpass={ligandActPass}
                onActPassChange={setLigandActPass}
                targetChain="B"
              />
            </div>
            <ReferenceStructureInput label="Reference structure (optional)">
              In example named data/target.pdb
            </ReferenceStructureInput>
            <FormErrors errors={errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
