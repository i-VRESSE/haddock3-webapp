import type { ClusterRow } from "../../tools/recluster.server";

export function ReClusterTable({ clusters }: { clusters: ClusterRow[] }) {
  // TODO add structure viewer with contacts (*.con file)
  return (
    <table className="table-compact table">
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
            <td>
              <a href={cluster.model_path} target="_blank" rel="noreferrer">
                {cluster.model_name}
              </a>
            </td>
            <td>{cluster.score}</td>
            <td>{cluster.cluster_id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
