import { useId } from "react";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { FormItem } from "./FormItem";

export function LabeledRadioGroupItem({
  value,
  children,
  ...props // Forwards props like disabled to RadioGroupItem
}: {
  value: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem {...props} value={value} id={id} className="bg-inherit" />
      <Label htmlFor={id}>{children}</Label>
    </div>
  );
}

export function LabeledRadioGroup<T extends string>({
  value,
  choices,
  onChange,
}: {
  value: T;
  choices: [T, string][];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <FormItem
      label="How would you like to select residues for restraints?"
      name={name}
    >
      <RadioGroup
        defaultValue={value}
        onValueChange={(value) => onChange(value as T)}
        className="pt-2"
      >
        {choices.map(([value, label]) => (
          <LabeledRadioGroupItem value={value} key={value}>
            {label}
          </LabeledRadioGroupItem>
        ))}
      </RadioGroup>
    </FormItem>
  );
}
