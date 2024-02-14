import type { FlatErrors } from "valibot";

export function ErrorMessages({
  path,
  errors,
}: {
  path: string;
  errors?: FlatErrors;
}) {
  if (!errors) return <></>;
  let issues: [string, ...string[]] | undefined = undefined;
  if (path === "root" && errors.root) {
    issues = errors.root;
  } else if (errors.nested[path] !== undefined) {
    issues = errors.nested[path];
  }
  if (!issues) return <></>;

  return (
    <div className="text-destructive">
      {issues.map((message: string) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
