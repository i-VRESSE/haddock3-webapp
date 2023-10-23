import type { ClusterRow } from "./shared";

export function ClusterTable({ clusters }: { clusters: ClusterRow[] }) {
  // TODO add structure viewer with contacts (*.con file)
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Model</th>
          <th>Score</th>
          <th>Cluster id</th>
        </tr>
      </thead>
      <tbody>
        {clusters.map((cluster) => (
          <tr key={cluster.rank}>
            <td>{cluster.rank}</td>
            <td>{cluster.model_name}</td>
            <td>{cluster.score}</td>
            <td>{cluster.cluster_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
