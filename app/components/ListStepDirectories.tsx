import { useMemo } from "react";
import type { DirectoryItem } from "~/bartender-client";

export function ListStepDirectories({
  files,
  prefix,
}: {
  files: DirectoryItem;
  prefix: string;
}) {
  const steps = useMemo(() => {
    if (!files.children) {
      return [];
    }
    const nonSteps = new Set(["analysis", "data", "log"]);
    return files.children.filter((i) => !nonSteps.has(i.name));
  }, [files]);
  return (
    <ul className="list-inside list-disc">
      {steps.map((step) => (
        <li key={step.path}>
          <a target="_blank" rel="noreferrer" href={`${prefix}${step.path}`}>
            &#128230; {step.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
