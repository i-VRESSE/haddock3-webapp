import { useId } from "react";
import { Checkbox } from "~/components/ui/checkbox";

export function LabeledCheckbox({
  value,
  onChange,
  children,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} defaultChecked={value} onCheckedChange={onChange} />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}
