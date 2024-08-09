import { FormDescription } from "@i-vresse/haddock3-ui/toggles";

export function MoleculeSubFormWrapper({
  legend,
  description,
  children,
}: {
  legend: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-solid border-primary p-3">
      <legend>{legend}</legend>

      <FormDescription>{description}</FormDescription>
      {children}
    </fieldset>
  );
}
