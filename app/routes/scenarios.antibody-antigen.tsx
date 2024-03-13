import { Form } from "@remix-run/react";
import { PropsWithChildren, useState } from "react";
import { FlatErrors } from "valibot";

import { ErrorMessages } from "~/components/ErrorMessages";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Viewer } from "~/scenario-antibody-antigen/Viewer.client";

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

// TODO from formdata construct archive with workflow config
// which looks like docking-antibody-antigen-CDR-accessible-full.cfg

export default function AntibodyAntigenScenario() {
    const [antibodyFile, setAntibodyFile] = useState<File | undefined>(undefined)
  
    function onAntibodyChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setAntibodyFile(event.target.files?.[0])
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
    <Form method="post">
<div className="columns-2">
    <div>
        <FormItem
            name="antibody"
            label="Antibody"
        >
            <Input type="file" 
                id="antibody"
                name="antibody"
                required
                accept=".pdb"
                onChange={onAntibodyChange}
            />
        </FormItem>
        <FormItem
            name="antigen"
            label="Antigen"
        >
            <Input type="file" 
                id="antigen"
                name="antigen"
                required
                accept=".pdb"
            />
        </FormItem>
        {/* <FormItem
            name="ambig_fname"
            label="Ambiguous restraints"
        >
            <Input type="file" 
                id="ambig_fname"
                name="ambig_fname"
                required
                accept=".tbl"
            />
        </FormItem>
        <FormItem
            name="unambig_fname"
            label="Unambiguous restraints"
        >
            <Input type="file" 
                id="unambig_fname"
                name="unambig_fname"
                required
                accept=".tbl"
            />
        </FormItem> */}
        <FormItem
            name="reference_fname"
            label="Reference structure"
        >
            <Input type="file" 
                id="reference_fname"
                name="reference_fname"
                required
                accept=".pdb"
            />
        </FormItem>

    </div>
    {Viewer !== undefined && 
    <Viewer
        antibodyFile={antibodyFile}
    />
}
</div>
        
         <div className="mt-4">
        <Button type="submit">Submit</Button>
        <Button variant="secondary">Refine in builder</Button>
            </div>   
      </Form>
    </div>
  );
}
