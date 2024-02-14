import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { ClusterRow } from "./recluster.server";

export function ReClusterTable({ clusters }: { clusters: ClusterRow[] }) {
  // TODO add structure viewer with contacts (*.con file)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Cluster id</TableHead>
        </TableRow>
      </TableHeader>
      <tbody>
        {clusters.map((cluster) => (
          <TableRow key={cluster.rank}>
            <TableCell>{cluster.rank}</TableCell>
            <TableCell>
              <a
                href={cluster.model_path}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {cluster.model_name}
              </a>
            </TableCell>
            <TableCell>{cluster.score}</TableCell>
            <TableCell>{cluster.cluster_id}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
