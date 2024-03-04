import { describe, test, expect } from "vitest";
import { parseReport } from "./contactmap.server";

describe("parseReport", () => {
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
    const result = parseReport(content);

    const expected = [4, 1, 10, 2, 5, 3, 11, 7, 6, 9, 8];
    expect(result).toEqual(expected);
  });
});
