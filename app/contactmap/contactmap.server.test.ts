import { describe, test, expect } from "vitest";

import {
  parseClusteredReport,
  parseUnClusteredReport,
} from "./contactmap.server";

const unclusteredReportHtml = `
<div id="contactmap_report">
    <ul>
        <li>
        <b>mdref_1_alascan:</b> <a href="Unclustered_contmap_mdref_1_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_1_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_1_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_1_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_1_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_5_alascan:</b> <a href="Unclustered_contmap_mdref_5_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_5_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_5_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_5_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_5_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_3_alascan:</b> <a href="Unclustered_contmap_mdref_3_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_3_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_3_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_3_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_3_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_2_alascan:</b> <a href="Unclustered_contmap_mdref_2_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_2_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_2_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_2_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_2_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_9_alascan:</b> <a href="Unclustered_contmap_mdref_9_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_9_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_9_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_9_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_9_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_10_alascan:</b> <a href="Unclustered_contmap_mdref_10_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_10_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_10_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_10_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_10_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_4_alascan:</b> <a href="Unclustered_contmap_mdref_4_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_4_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_4_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_4_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_4_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_6_alascan:</b> <a href="Unclustered_contmap_mdref_6_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_6_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_6_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_6_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_6_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_8_alascan:</b> <a href="Unclustered_contmap_mdref_8_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_8_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_8_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_8_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_8_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
        <li><b>mdref_7_alascan:</b> <a href="Unclustered_contmap_mdref_7_alascan_chordchart.html" target="_blank">chordchart.html</a>, <a href="Unclustered_contmap_mdref_7_alascan_heatmap.html" target="_blank">heatmap.html</a>, <a href="Unclustered_contmap_mdref_7_alascan_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="Unclustered_contmap_mdref_7_alascan_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="Unclustered_contmap_mdref_7_alascan_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a>
        </li>
    </ul>
</div>
` as const;

describe("parseClusteredReport", () => {
  describe("clustered", () => {
    test("should return 11 clusters ordered by score", () => {
      const content = `<div id="contactmap_report">
<ul>
    <li>
    <b>Cluster_4:</b> <a href="cluster4_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster4_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster4_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster4_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster4_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_1:</b> <a href="cluster1_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster1_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster1_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster1_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster1_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_10:</b> <a href="cluster10_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster10_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster10_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster10_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster10_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_2:</b> <a href="cluster2_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster2_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster2_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster2_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster2_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_5:</b> <a href="cluster5_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster5_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster5_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster5_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster5_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_3:</b> <a href="cluster3_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster3_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster3_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster3_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster3_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_11:</b> <a href="cluster11_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster11_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster11_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster11_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster11_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_7:</b> <a href="cluster7_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster7_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster7_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster7_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster7_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_6:</b> <a href="cluster6_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster6_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster6_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster6_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster6_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_9:</b> <a href="cluster9_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster9_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster9_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster9_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster9_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a></li>
    <li><b>Cluster_8:</b> <a href="cluster8_contmap_chordchart.html" target="_blank">chordchart.html</a>, <a href="cluster8_contmap_heatmap.html" target="_blank">heatmap.html</a>, <a href="cluster8_contmap_contacts.tsv" target="_blank">contacts.tsv</a>, <a href="cluster8_contmap_heavyatoms_interchain_contacts.tsv" target="_blank">heavyatoms_interchain_contacts.tsv</a>, <a href="cluster8_contmap_interchain_contacts.tsv" target="_blank">interchain_contacts.tsv</a>
    </li>
</ul>
</div>
`;
      const result = parseClusteredReport(content);

      const expected = [4, 1, 10, 2, 5, 3, 11, 7, 6, 9, 8];
      expect(result).toEqual(expected);
    });
  });

  describe("unclustered", () => {
    test("should return 1 cluster", () => {});
    const result = parseClusteredReport(unclusteredReportHtml);

    const expected: number[] = [];
    expect(result).toEqual(expected);
  });
});

describe("parseUnClusteredReport", () => {
  describe("unclustered", () => {
    test("should return 10 models", () => {});
    const result = parseUnClusteredReport(unclusteredReportHtml);

    const expected = {
      fns: [
        "mdref_1_alascan",
        "mdref_5_alascan",
        "mdref_3_alascan",
        "mdref_2_alascan",
        "mdref_9_alascan",
        "mdref_10_alascan",
        "mdref_4_alascan",
        "mdref_6_alascan",
        "mdref_8_alascan",
        "mdref_7_alascan",
      ],
      ids: [1, 5, 3, 2, 9, 10, 4, 6, 8, 7],
    };
    expect(result).toEqual(expected);
  });
});
