import { assert, describe, test } from "vitest";

import { DirectoryItem } from "~/bartender-client/types";
import { JobModuleInfo } from "~/models/module_utils";
import { getClustersAndModels } from "./alascan.server";

describe("getClustersAndModels()", () => {
  describe("clustered", () => {
    test("should return cluster ids and 2 models", () => {
      const files: DirectoryItem = {
        name: "8_alascan",
        path: "output/8_alascan",
        is_dir: true,
        is_file: false,
        children: [
          {
            name: "alascan_0.scan",
            path: "output/8_alascan/alascan_0.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_1.scan",
            path: "output/8_alascan/alascan_1.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "cluster_1_model_1_alascan.pdb.gz",
            path: "output/8_alascan/cluster_1_model_1_alascan.pdb.gz",
            is_dir: false,
            is_file: true,
          },
          {
            name: "cluster_1_model_2_alascan.pdb.gz",
            path: "output/8_alascan/cluster_1_model_2_alascan.pdb.gz",
            is_dir: false,
            is_file: true,
          },
          {
            name: "io.json",
            path: "output/8_alascan/io.json",
            is_dir: false,
            is_file: true,
          },
          {
            name: "params.cfg",
            path: "output/8_alascan/params.cfg",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_clt_1.csv",
            path: "output/8_alascan/scan_clt_1.csv",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_clt_1.html",
            path: "output/8_alascan/scan_clt_1.html",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_cluster_1_model_1.csv",
            path: "output/8_alascan/scan_cluster_1_model_1.csv",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_cluster_1_model_2.csv",
            path: "output/8_alascan/scan_cluster_1_model_2.csv",
            is_dir: false,
            is_file: true,
          },
        ],
      };
      const info: JobModuleInfo = {
        jobid: 1,
        index: 8,
        name: "alascan",
        hasInteractiveVersion: false,
        indexPadding: 1,
      };
      const result = getClustersAndModels(files, info);

      const expected = {
        clusterIds: ["1"],
        models: {
          "1": [
            {
              id: "1",
              pdb: "/jobs/1/files/output/8_alascan/cluster_1_model_1_alascan.pdb.gz",
              csv: "/jobs/1/files/output/8_alascan/scan_cluster_1_model_1.csv",
            },
            {
              id: "2",
              pdb: "/jobs/1/files/output/8_alascan/cluster_1_model_2_alascan.pdb.gz",
              csv: "/jobs/1/files/output/8_alascan/scan_cluster_1_model_2.csv",
            },
          ],
        },
      };
      assert.deepEqual(result, expected);
    });
  });

  describe("unclustered", () => {
    test("should have - as cluster id and a model", () => {
      const files: DirectoryItem = {
        name: "3_alascan",
        path: "output/3_alascan",
        is_dir: true,
        is_file: false,
        children: [
          {
            name: "alascan_0.scan",
            path: "output/3_alascan/alascan_0.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_1.scan",
            path: "output/3_alascan/alascan_1.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_2.scan",
            path: "output/3_alascan/alascan_2.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_3.scan",
            path: "output/3_alascan/alascan_3.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_4.scan",
            path: "output/3_alascan/alascan_4.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "alascan_5.scan",
            path: "output/3_alascan/alascan_5.scan",
            is_dir: false,
            is_file: true,
          },
          {
            name: "io.json",
            path: "output/3_alascan/io.json",
            is_dir: false,
            is_file: true,
          },
          {
            name: "mdref_1_alascan.pdb.gz",
            path: "output/3_alascan/mdref_1_alascan.pdb.gz",
            is_dir: false,
            is_file: true,
          },
          {
            name: "params.cfg",
            path: "output/3_alascan/params.cfg",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_clt_-.csv",
            path: "output/3_alascan/scan_clt_-.csv",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_clt_-.html",
            path: "output/3_alascan/scan_clt_-.html",
            is_dir: false,
            is_file: true,
          },
          {
            name: "scan_mdref_1.csv",
            path: "output/3_alascan/scan_mdref_1.csv",
            is_dir: false,
            is_file: true,
          },
        ],
      };
      const info: JobModuleInfo = {
        jobid: 1,
        index: 3,
        name: "alascan",
        hasInteractiveVersion: false,
        indexPadding: 1,
      };
      const result = getClustersAndModels(files, info);

      const expected = {
        clusterIds: ["-"],
        models: {
          "-": [
            {
              id: "1",
              pdb: "/jobs/1/files/output/3_alascan/mdref_1_alascan.pdb.gz",
              csv: "/jobs/1/files/output/3_alascan/scan_mdref_1.csv",
            },
          ],
        },
      };
      assert.deepEqual(result, expected);
    });
  });
});
