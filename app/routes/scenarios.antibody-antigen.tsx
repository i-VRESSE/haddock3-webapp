import { useState } from "react";
import { json, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import JSZip from "jszip";
import {
  InferOutput,
  ValiError,
  instance,
  integer,
  minSize,
  minValue,
  object,
  optional,
  pipe,
  string,
  transform,
} from "valibot";
import { LoaderFunctionArgs } from "@remix-run/node";

import {
  JOB_OUTPUT_DIR,
  WORKFLOW_CONFIG_FILENAME,
} from "~/bartender-client/constants";
import { action as uploadaction } from "./upload";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { parseFormData } from "~/scenarios/schema";
import { mustBeAllowedToSubmit } from "~/auth.server";
import { ClientOnly } from "~/components/ClientOnly";

import { ActPassSelection, countSelected } from "~/scenarios/ActPassSelection";
import {
  generateAmbiguousRestraintsFile,
  generateUnAmbiguousRestraintsFile,
} from "~/scenarios/restraints";
import { FormErrors } from "~/scenarios/FormErrors";
import { ReferenceStructureInput } from "~/scenarios/ReferenceStructureInput";
import { MacroMoleculeSubForm } from "~/scenarios/MacroMoleculeSubForm.client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  antibody: instance(File, "Antibody structure as PDB file"),
  antigen: instance(File, "Antibody structure as PDB file"),
  ambig_fname: pipe(
    instance(File, "Ambiguous restraints as TBL file"),
    minSize(
      1,
      "Ambiguous restraints file should not be empty. Please select some residues.",
    ),
  ),
  unambig_fname: optional(instance(File, "Unambiguous restraints as TBL file")),
  reference_fname: optional(instance(File, "Reference structure as PDB file")),
  nrSelectedAntibodyResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the antibody."),
  ),
  nrSelectedAntigenResidues: pipe(
    string(),
    transform(Number),
    integer(),
    minValue(1, "At least one residue must be selected for the antigen."),
  ),
});
type Schema = InferOutput<typeof Schema>;

function generateWorkflow(data: Schema) {
  // create workflow.cfg with form data as values for filename fields

  // Workflow based on
  // scenario2a-NMR-epitope-pass-short.cfg
  // in https://surfdrive.surf.nl/files/index.php/s/HvXxgxCTY1DiPsV
  // from
  // https://www.bonvinlab.org/education/HADDOCK3/HADDOCK3-antibody-antigen/#setuprequirements
  // but made valid for easy expertise level
  const unambig_line = data.unambig_fname
    ? `# Restraints to keep the antibody chains together
unambig_fname = "${data.unambig_fname.name}"`
    : "";
  const ref_line = data.reference_fname
    ? `reference_fname = "${data.reference_fname.name}"`
    : "";
  return `
# ====================================================================
# Antibody-antigen docking example with restraints from the antibody
# paratope to the NMR-identified epitope on the antigen (as passive)
# ====================================================================

# directory name of the run
run_dir = "${JOB_OUTPUT_DIR}"

# molecules to be docked
molecules =  [
    "${data.antibody.name}",
    "${data.antigen.name}"
    ]

# ====================================================================
# Parameters for each stage are defined below, prefer full paths
# ====================================================================
[topoaa]

[rigidbody]
# number of models to generate
sampling = 1000
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
# Turn off ramdom removal of restraints
# randremoval = false

[clustfcc]
min_population = 10

[seletopclusts]
## select all the clusters
top_cluster = 500
## select the best 10 models of each cluster
top_models = 10

[caprieval]
# this is only for this tutorial to check the performance at the rigidbody stage
${ref_line}

[flexref]
# Acceptable percentage of model failures
# tolerance = 5
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
# Turn off ramdom removal of restraints
# randremoval = false

[emref]
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
# Turn off ramdom removal of restraints
# randremoval = false

[clustfcc]

[seletopclusts]
top_cluster = 500

[caprieval]
${ref_line}

[contactmap]

# ====================================================================

`;
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.antibody.name, data.antibody);
  zip.file(data.antigen.name, data.antigen);
  zip.file(data.ambig_fname.name, data.ambig_fname);
  if (data.unambig_fname) {
    zip.file(data.unambig_fname.name, data.unambig_fname);
  }
  if (data.reference_fname) {
    zip.file(data.reference_fname.name, data.reference_fname);
  }
  return zip.generateAsync({ type: "blob" });
}

export default function AntibodyAntigenScenario() {
  const actionData = useActionData<typeof uploadaction>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [antibodyActPass, seAntibodyActPass] = useState<ActPassSelection>({
    active: [],
    passive: [],
    neighbours: [],
    chain: "",
    bodyRestraints: "",
  });
  const [antigenActPass, setAntigen2ActPass] = useState<ActPassSelection>({
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

    formData.set("nrSelectedAntibodyResidues", countSelected(antibodyActPass));
    formData.set("nrSelectedAntigenResidues", countSelected(antigenActPass));

    const ambig_fname = await generateAmbiguousRestraintsFile(
      antibodyActPass,
      antigenActPass,
    );
    formData.set("ambig_fname", ambig_fname);

    const unambig_fname = generateUnAmbiguousRestraintsFile(
      antibodyActPass.bodyRestraints,
      antigenActPass.bodyRestraints,
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
      <h1 className="text-3xl">Antibody-antigen scenario</h1>
      <p>
        Based on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          href="https://www.bonvinlab.org/education/HADDOCK3/HADDOCK3-antibody-antigen/"
        >
          HADDOCK3 Antibody Antigen tutorial
        </a>
        .
      </p>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-6">
              {/* TODO nice to have, color residues that are in Complementarity-determining regions (CDRs) */}
              <MacroMoleculeSubForm
                name="antibody"
                legend="Antibody"
                description="In tutorial named pdbs/4G6K_clean.pdb"
                actpass={antibodyActPass}
                onActPassChange={seAntibodyActPass}
                targetChain="A"
                preprocessPipeline="delhetatmkeepcoord"
                accessibilityCutoff={0.15}
              />
              <div>
                <MacroMoleculeSubForm
                  name="antigen"
                  legend="Antigen"
                  description="In tutorial named pdbs/4I1B_clean.pdb"
                  actpass={antigenActPass}
                  onActPassChange={setAntigen2ActPass}
                  targetChain="B"
                  preprocessPipeline="delhetatmkeepcoord"
                  accessibilityCutoff={0.15}
                />
              </div>
            </div>
            <div>
              {/* either using the NMR identified residues as active in HADDOCK, 
            or combining those with the surface neighbors and use this combination as passive only. */}
            </div>
            <ReferenceStructureInput>
              In tutorial named pdbs/4G6M_matched.pdb
            </ReferenceStructureInput>
            <FormErrors errors={errors} />
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
