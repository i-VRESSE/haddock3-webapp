import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function ChainSelect({
  chains,
  onSelect,
  selected,
}: {
  chains: string[];
  onSelect: (chain: string) => void;
  selected: string;
}) {
  if (chains.length === 1 && selected === chains[0]) {
    return <b>{selected}</b>;
  }
  return (
    <Select onValueChange={onSelect} value={selected}>
      <SelectTrigger className="inline-flex w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain} value={chain}>
            {chain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
