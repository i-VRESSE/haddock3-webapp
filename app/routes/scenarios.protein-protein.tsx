import { useState } from "react";
import { useActionData, useSubmit, useNavigate, json } from "@remix-run/react";
import { object, instance, Output, optional } from "valibot";
import JSZip from "jszip";
import NGL from "ngl";
import { LoaderFunctionArgs } from "@remix-run/node";

import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";
import { ActionButtons, handleActionButton } from "~/scenarios/actions";
import { parseFormData } from "~/scenarios/schema";
import { FormDescription } from "~/scenarios/FormDescription";
import { FormItem } from "~/scenarios/FormItem";
import { PDBFileInput } from "~/scenarios/PDBFileInput.client";
import { MolViewerDialog } from "~/scenarios/MolViewerDialog.client";
import { action as uploadaction } from "./upload";
import {
  ActPassSelection,
  MoleculeSubForm,
} from "~/scenarios/MoleculeSubForm.client";
import { Molecule, chainsFromStructure } from "~/scenarios/molecule.client";
import { ClientOnly } from "~/components/ClientOnly";
import { mustBeAllowedToSubmit } from "~/auth.server";
import {
  generateAmbiguousRestraintsFile,
  generateUnAmbiguousRestraintsFile,
} from "../scenarios/restraintsFile";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await mustBeAllowedToSubmit(request);
  return json({});
};

export const action = uploadaction;

const Schema = object({
  protein1: instance(File, "First protein structure as PDB file"),
  protein2: instance(File, "Second protein structure as PDB file"),
  ambig_fname: instance(File, "Ambiguous restraints as TBL file"),
  unambig_fname: optional(instance(File, "Unambiguous restraints as TBL file")),
  reference_fname: instance(File, "Reference structure as PDB file"),
});
type Schema = Output<typeof Schema>;

function generateWorkflow(data: Schema) {
  // Workflow based on
  // https://github.com/haddocking/haddock3/blob/main/examples/docking-protein-protein/docking-protein-protein-full.cfg
  // made valid for easy expertise level

  const unambig_line = data.unambig_fname
    ? `unambig_fname = "${data.unambig_fname.name}"`
    : "";
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
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}
sampling = 1000

[caprieval]
reference_fname = "${data.reference_fname.name}"

[seletop]
select = 200

[caprieval]
reference_fname = "${data.reference_fname.name}"

[flexref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}

[caprieval]
reference_fname = "${data.reference_fname.name}"

[emref]
ambig_fname = "${data.ambig_fname.name}"
${unambig_line}

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
    active: { chain: "", resno: [] },
    passive: { chain: "", resno: [] },
    bodyRestraints: "",
  });
  const [protein2ActPass, setProtein2ActPass] = useState<ActPassSelection>({
    active: { chain: "", resno: [] },
    passive: { chain: "", resno: [] },
    bodyRestraints: "",
  });

  const [reference, setReference] = useState<Molecule | undefined>();
  function referenceLoaded(structure: NGL.Structure, file: File) {
    const chains = chainsFromStructure(structure);
    setReference({ structure, chains, file, originalFile: file });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

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
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => (
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <MoleculeSubForm
                name="protein1"
                legend="First protein"
                description="In example named data/e2a-hpr_1GGR.pdb"
                actpass={protein1ActPass}
                onActPassChange={setProtein1ActPass}
                targetChain="A"
              />
              <MoleculeSubForm
                name="protein2"
                legend="Second protein"
                description="In example named data/hpr_ensemble.pdb"
                actpass={protein2ActPass}
                onActPassChange={setProtein2ActPass}
                targetChain="B"
              />
            </div>
            <FormItem name="reference_fname" label="Reference structure">
              <div className="flex">
                <PDBFileInput
                  name="reference_fname"
                  onStructureLoad={referenceLoaded}
                />
                <MolViewerDialog structure={reference?.file} />
              </div>
              <FormDescription>
                In example named data/e2a-hpr_1GGR.pdb
              </FormDescription>
            </FormItem>
            <div className="py-2 text-destructive-foreground">
              {actionData?.errors.map((error) => <p key={error}>{error}</p>)}
            </div>
            <ActionButtons />
          </form>
        )}
      </ClientOnly>
    </>
  );
}
