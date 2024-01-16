import { parseTsv } from "~/models/tsv";

export const parseClusterTsv = (body: string) => parseTsv<ClusterRow>(body, false, true);

export interface ClusterRow {
    rank: number;
    model_name: string;
    score: number;
    cluster_id: number | "-";
}

