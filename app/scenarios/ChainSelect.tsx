export function ChainSelect({
  chains,
  onSelect,
  selected,
}: {
  chains: string[];
  onSelect: (chain: string) => void;
  selected: string;
}) {
  // TODO if there is a single chain the select it
  return (
    <select
      defaultValue={selected}
      onChange={(e) => {
        e.preventDefault();
        onSelect(e.target.value);
      }}
    >
      <option value="">Select a chain</option>
      {chains.map((chain) => (
        <option key={chain} value={chain}>
          {chain}
        </option>
      ))}
    </select>
  );
}
