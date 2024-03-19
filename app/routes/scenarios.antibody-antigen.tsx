import {
  NavigateFunction,
  SubmitFunction,
  useActionData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import JSZip from "jszip";
import { PropsWithChildren, useState } from "react";
import { FlatErrors, Output, instance, mimeType, object, parse } from "valibot";
import { WORKFLOW_CONFIG_FILENAME } from "~/bartender-client/constants";

import { ErrorMessages } from "~/components/ErrorMessages";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Viewer } from "~/scenario-antibody-antigen/Viewer.client";
import { action as uploadaction } from "./upload";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "~/components/ui/dialog";

export const action = uploadaction;

function FormItem({
  name,
  label,
  children,
  errors,
}: PropsWithChildren<{
  name: string;
  label: string;
  errors?: FlatErrors;
}>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {errors && <ErrorMessages path={name} errors={errors} />}
    </div>
  );
}

function FormDescription({ children }: PropsWithChildren): JSX.Element {
  return <p className="text-[0.8rem] text-muted-foreground">{children}</p>;
}

function PDBFileInput({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [open, setOpen] = useState(false);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    setFile(event.target.files?.[0]);
  }

  return (
    <div className="flex">
      <Input
        type="file"
        id={name}
        name={name}
        required={required}
        accept=".pdb"
        onChange={onChange}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={!file}
            title="Preview in 3D"
            variant="ghost"
            size="icon"
          >
            👁
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2/3 h-2/3 w-2/3">
          {file !== undefined && open && <Viewer file={file} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function generateWorkflow(data: Schema) {
  // TODO create workflow.cfg with form data as values for filename fields

  // Workflow based on
  // scenario2a-NMR-epitope-pass-short.cfg
  // in https://surfdrive.surf.nl/files/index.php/s/HvXxgxCTY1DiPsV
  // from
  // https://www.bonvinlab.org/education/HADDOCK3/HADDOCK3-antibody-antigen/#setuprequirements
  // but made valid for easy expertise level
  return `
# ====================================================================
# Antibody-antigen docking example with restraints from the antibody
# paratope to the NMR-identified epitope on the antigen (as passive)
# ====================================================================

# directory name of the run
run_dir = "scenario2a-NMR-epitope-pass-short"

# Compute mode
mode = "local"
# 10 cores
ncores = 10

# Self contained rundir
#self_contained = false

# Post-processing to generate statistics and plots
postprocess = true

# Cleaning
clean = true

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
sampling = 200
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
# Restraints to keep the antibody chains together
unambig_fname = "${data.unambig_fname.name}"
# Turn off ramdom removal of restraints
randremoval = false

[clustfcc]
min_population = 10

[seletopclusts]
## select all the clusters
top_cluster = 500
## select the best 10 models of each cluster
top_models = 10

[caprieval]
# this is only for this tutorial to check the performance at the rigidbody stage
reference_fname = "${data.reference_fname.name}"

[flexref]
# Acceptable percentage of model failures
tolerance = 5
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
# Restraints to keep the antibody chains together
unambig_fname = "${data.unambig_fname.name}"
# Turn off ramdom removal of restraints
randremoval = false

[emref]
# paratope to surface ambig restraints
ambig_fname = "${data.ambig_fname.name}"
# Restraints to keep the antibody chains together
unambig_fname = "${data.unambig_fname.name}"
# Turn off ramdom removal of restraints
randremoval = false

[clustfcc]

[seletopclusts]
top_cluster = 500

[caprieval]
reference_fname = "${data.reference_fname.name}"

# ====================================================================

`;
}

const pdbMimeType = mimeType<File>(
  [
    "chemical/x-pdb",
    "chemical/x-pdbx",
    "application/vnd.palm",
    "application/x-aportisdoc",
  ],
  "Please select a PDB file"
);

const Schema = object({
  antibody: instance(File, "Antibody molecules as PDB file", [pdbMimeType]),
  antigen: instance(File, "Antibody molecules as PDB file", [pdbMimeType]),
  // restraints get type==='' so cannot check for file type
  ambig_fname: instance(File, "Ambiguous restraints as TBL file"),
  unambig_fname: instance(File, "Unambiguous restraints as TBL file"),
  reference_fname: instance(File, "Reference structure as PDB file", [
    pdbMimeType,
  ]),
});
type Schema = Output<typeof Schema>;

function parseFormData(formData: FormData) {
  const obj = Object.fromEntries(formData.entries());
  return parse(Schema, obj);
}

async function createZip(workflow: string, data: Schema) {
  const zip = new JSZip();
  zip.file(WORKFLOW_CONFIG_FILENAME, workflow);
  zip.file(data.antibody.name, data.antibody);
  zip.file(data.antigen.name, data.antigen);
  zip.file(data.ambig_fname.name, data.ambig_fname);
  zip.file(data.unambig_fname.name, data.unambig_fname);
  zip.file(data.reference_fname.name, data.reference_fname);
  return zip.generateAsync({ type: "blob" });
}

function doUpload(zipPromise: Promise<Blob>, submit: SubmitFunction) {
  zipPromise.then((zip) => {
    // TODO upload archive to server
    const formData = new FormData();
    formData.set("upload", zip);
    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  });
}

function onRefine(zipPromise: Promise<Blob>, navigate: NavigateFunction) {
  // add zip to browsers indexeddb haddock3 db, zips object store, key workflow.zip
  if (typeof indexedDB === "undefined") {
    console.error("IndexedDB not supported, unable to save workflow.zip file.");
    return;
  }

  const open = indexedDB.open("haddock3", 1);
  open.onerror = function () {
    console.error("Error opening indexeddb", open.error);
  };
  open.onupgradeneeded = function () {
    const db = open.result;
    db.createObjectStore("zips");
  };
  open.onblocked = function () {
    console.error("Error opening indexeddb, blocked");
  };
  open.onsuccess = function () {
    zipPromise.then((zip) => {
      const db = open.result;
      const tx = db.transaction("zips", "readwrite");
      const zips = tx.objectStore("zips");
      const putRequest = zips.put(zip, "workflow.zip");
      putRequest.onerror = function () {
        console.error("Error putting zip in indexeddb", putRequest.error);
      };
      putRequest.onsuccess = function () {
        navigate("/builder");
      };
    });
  };
}

function onDownload(zipPromise: Promise<Blob>) {
  zipPromise.then((zip) => {
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}

export default function AntibodyAntigenScenario() {
  const actionData = useActionData<typeof uploadaction>();
  const submit = useSubmit();
  const navigate = useNavigate();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = parseFormData(formData);
    const workflow = generateWorkflow(data);
    const zipPromise = createZip(workflow, data);
    // TODO validate zip against catalog, now done on server for kind=upload
    // or on /builder page in devtools console for kind=refine
    const nativeEvent = event.nativeEvent as SubmitEvent;
    const kind = nativeEvent.submitter?.getAttribute("value");
    if (kind === "refine") {
      onRefine(zipPromise, navigate);
    } else if (kind === "download") {
      onDownload(zipPromise);
    } else {
      doUpload(zipPromise, submit);
    }
  }

  return (
    <div>
      <h1 className="text-3xl">Antibody Antigen Scenario</h1>
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
      </p>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <FormItem name="antibody" label="Antibody">
            <PDBFileInput name="antibody" required />
            <FormDescription>
              In tutorial named pdbs/4G6K_clean.pdb
            </FormDescription>
          </FormItem>
          <FormItem name="antigen" label="Antigen">
            <PDBFileInput name="antigen" required />
            <FormDescription>
              In tutorial named pdbs/4I1B_clean.pdb
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
              In tutorial named restraints/ambig-paratope-NMR-epitope-pass.tbl
            </FormDescription>
          </FormItem>
          <FormItem name="unambig_fname" label="Unambiguous restraints">
            <Input
              type="file"
              id="unambig_fname"
              name="unambig_fname"
              required
              accept=".tbl"
            />
            <FormDescription>
              In tutorial named restraints/antibody-unambig.tbl
            </FormDescription>
          </FormItem>
          <FormItem name="reference_fname" label="Reference structure">
            <PDBFileInput name="reference_fname" />
            <FormDescription>
              In tutorial named pdbs/4G6M_matched.pdb
            </FormDescription>
          </FormItem>
        </div>
        <div className="py-2 text-red-500">
          {actionData?.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
        <div className="mt-4">
          <Button type="submit" name="kind" value="upload">
            Submit
          </Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
          <Button type="submit" name="kind" value="refine" variant="secondary">
            Refine in builder
          </Button>
          <Button
            type="submit"
            variant="secondary"
            name="kind"
            value="download"
          >
            Download workfow.zip
          </Button>
        </div>
      </form>
    </div>
  );
}
