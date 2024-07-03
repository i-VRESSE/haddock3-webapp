import { Molecule } from "./AtomStructureSubForm.client";

export function RestraintsErrorsReport({
  errors,
}: {
  errors: Molecule["errors"];
}) {
  if (!errors) {
    return null;
  }
  return (
    <div className="text-destructive">
      {errors.accessibility && (
        <>
          <div>Error calculating accessibility:</div>
          <div>{errors.accessibility}</div>
        </>
      )}
      <span>Please fix the PDB file, re-upload and select chain again.</span>
    </div>
  );
}
