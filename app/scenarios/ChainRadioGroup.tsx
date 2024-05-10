import { useId } from "react";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

export function ChainRadioGroup({
  chains,
  onSelect,
  selected,
}: {
  chains: string[];
  onSelect: (chain: string) => void;
  selected: string;
}) {
  const id = useId();
  if (chains.length > 5) {
    return (
      <select
        className="w-full rounded bg-inherit p-1 text-inherit"
        defaultValue={selected}
        onChange={(e) => {
          e.preventDefault();
          onSelect(e.target.value);
        }}
      >
        <option value="">Select a chain</option>
        {chains.map((chain) => (
          <option key={`${id}-${chain}`} value={chain}>
            {chain}
          </option>
        ))}
      </select>
    );
  }
  return (
    <RadioGroup
      defaultValue={selected}
      onValueChange={onSelect}
      className="grid-flow-col"
    >
      {chains.map((chain) => (
        <div key={`${id}-${chain}`} className="flex items-center space-x-2">
          <RadioGroupItem
            value={chain}
            id={id + chain}
            className="bg-inherit"
          />
          <Label htmlFor={id + chain}>{chain}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
