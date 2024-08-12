import { PropsWithChildren } from "react";
import { FlatErrors } from "valibot";
import { ErrorMessages } from "~/components/ErrorMessages";
import { Label } from "~/components/ui/label";

export function FormItem({
  name,
  label,
  children,
  errors,
}: PropsWithChildren<{
  name: string;
  label: string;
  errors?: FlatErrors<undefined>;
}>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {errors && <ErrorMessages path={name} errors={errors} />}
    </div>
  );
}
