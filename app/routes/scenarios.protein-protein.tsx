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
import { ReferenceStructureInput } from "~/scenarios/ReferenceStructureInput";
import { MacroMoleculeSubForm } from "~/scenarios/MacroMoleculeSubForm.client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  protein1: instance(File, "First protein structure as PDB file"),
  protein2: instance(File, "Second protein structure as PDB file"),
  nrSelectedProtein1Residues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the first protein."),
  ),
  nrSelectedProtein2Residues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(
      1,
      "At least one residue must be selected for the second protein.",
    ),
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
# ====================================================================
# Protein-protein docking example with NMR-derived ambiguous interaction restraints

# directory in which the scoring will be done
run_dir = "${JOB_OUTPUT_DIR}"

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

[caprieval]
${ref_line}

[emref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}

[caprieval]
${ref_line}

[clustfcc]

[seletopclusts]
top_models = 4

[caprieval]
${ref_line}

[contactmap]

# ====================================================================
`;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.protein1.name, data.protein1);
  zip.file(data.protein2.name, data.protein2);
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

  const [protein1ActPass, setProtein1ActPass] = useState<ActPassSelection>({
    active: [],
    passive: [],
    neighbours: [],
    chain: "",
    bodyRestraints: "",
  });
  const [protein2ActPass, setProtein2ActPass] = useState<ActPassSelection>({
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

    formData.set("nrSelectedProtein1Residues", countSelected(protein1ActPass));
    formData.set("nrSelectedProtein2Residues", countSelected(protein2ActPass));

    const ambig_fname = await generateAmbiguousRestraintsFile(
      protein1ActPass,
      protein2ActPass,
    );
    formData.set("ambig_fname", ambig_fname);

    const unambig_fname = generateUnAmbiguousRestraintsFile(
      protein1ActPass.bodyRestraints,
      protein2ActPass.bodyRestraints,
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
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <MacroMoleculeSubForm
                name="protein1"
                legend="First protein"
                description="In example named data/e2a-hpr_1GGR.pdb"
                actpass={protein1ActPass}
                onActPassChange={setProtein1ActPass}
                targetChain="A"
                preprocessPipeline="delhetatmkeepcoord"
              />
              <MacroMoleculeSubForm
                name="protein2"
                legend="Second protein"
                description="In example named data/hpr_ensemble.pdb"
                actpass={protein2ActPass}
                onActPassChange={setProtein2ActPass}
                targetChain="B"
                preprocessPipeline="delhetatmkeepcoord"
              />
            </div>
            <ReferenceStructureInput>
              In example named data/e2a-hpr_1GGR.pdb
            </ReferenceStructureInput>
            <FormErrors errors={errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
