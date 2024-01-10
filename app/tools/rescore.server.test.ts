import { describe, test, expect } from "vitest";
import type { components } from "~/bartender-client/bartenderschema";
import { interactivenessOfModule, getLastCaprievalModule } from "./shared";
import { buildPath } from "~/models/job.server";

type DirectoryItem = components["schemas"]["DirectoryItem"];

function outputFileWithoutInteractivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    is_dir: true,
    is_file: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        is_dir: true,
        is_file: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        is_dir: true,
        is_file: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        is_dir: true,
        is_file: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        is_dir: true,
        is_file: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        is_dir: true,
        is_file: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        is_dir: true,
        is_file: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        is_dir: true,
        is_file: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        is_dir: true,
        is_file: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        is_dir: true,
        is_file: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        is_dir: true,
        is_file: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        is_dir: true,
        is_file: false,
      },
      {
        name: "data",
        path: "output/data",
        is_dir: true,
        is_file: false,
      },
      {
        name: "log",
        path: "output/log",
        is_dir: false,
        is_file: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        is_dir: true,
        is_file: false,
      },
    ],
  };
}

function outputFileWtih3Interactivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    is_dir: true,
    is_file: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        is_dir: true,
        is_file: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        is_dir: true,
        is_file: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        is_dir: true,
        is_file: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        is_dir: true,
        is_file: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        is_dir: true,
        is_file: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        is_dir: true,
        is_file: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        is_dir: true,
        is_file: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        is_dir: true,
        is_file: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        is_dir: true,
        is_file: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        is_dir: true,
        is_file: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        is_dir: true,
        is_file: false,
      },
      {
        name: "15_caprieval_interactive",
        path: "output/15_caprieval_interactive",
        is_dir: true,
        is_file: false,
      },
      {
        name: "15_caprieval_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive",
        is_dir: true,
        is_file: false,
      },
      {
        name: "15_caprieval_interactive_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive_interactive",
        is_dir: true,
        is_file: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        is_dir: true,
        is_file: false,
      },
      {
        name: "data",
        path: "output/data",
        is_dir: true,
        is_file: false,
      },
      {
        name: "log",
        path: "output/log",
        is_dir: false,
        is_file: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        is_dir: true,
        is_file: false,
      },
    ],
  };
}

describe("getLastCaprievalModule", () => {
  test("should return the last caprieval module", () => {
    const files = outputFileWithoutInteractivness();
    const result = getLastCaprievalModule(files);
    const expected = 15;
    expect(result).toEqual(expected);
  });
});

describe("interactivenessOfModule", () => {
  test.each([
    [outputFileWithoutInteractivness(), 0],
    [outputFileWtih3Interactivness(), 3],
  ])("should return the number of interactive modules", (files, expected) => {
    const result = interactivenessOfModule(15, files);
    expect(result).toEqual(expected);
  });
});

describe("buildPath()", () => {
  test.each([
    [{ moduleIndex: 1, moduleName: "caprieval" }, "output/01_caprieval/"],
    [{ moduleIndex: 15, moduleName: "caprieval" }, "output/15_caprieval/"],
    [
      { moduleIndex: 1, moduleName: "caprieval", interactivness: 1 },
      "output/01_caprieval_interactive/",
    ],
    [
      { moduleIndex: 1, moduleName: "caprieval", interactivness: 2 },
      "output/01_caprieval_interactive_interactive/",
    ],
    [
      { moduleIndex: 1, moduleName: "caprieval", interactivness: 3 },
      "output/01_caprieval_interactive_interactive_interactive/",
    ],
  ])("should return the correct path", (input, expected) => {
    const result = buildPath({ ...input, moduleIndexPadding: 2 });
    expect(result).toEqual(expected);
  });
});
