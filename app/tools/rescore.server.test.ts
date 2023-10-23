import { describe, test, expect } from "vitest";
import type { DirectoryItem } from "~/bartender-client";
import { interactivenessOfModule, getLastCaprievalModule } from "./shared";
import { buildPath } from "~/models/job.server";

function outputFileWithoutInteractivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    isDir: true,
    isFile: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        isDir: true,
        isFile: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        isDir: true,
        isFile: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        isDir: true,
        isFile: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        isDir: true,
        isFile: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        isDir: true,
        isFile: false,
      },
      {
        name: "data",
        path: "output/data",
        isDir: true,
        isFile: false,
      },
      {
        name: "log",
        path: "output/log",
        isDir: false,
        isFile: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        isDir: true,
        isFile: false,
      },
    ],
  };
}

function outputFileWtih3Interactivness(): DirectoryItem {
  return {
    name: "output",
    path: "output",
    isDir: true,
    isFile: false,
    children: [
      {
        name: "00_topoaa",
        path: "output/00_topoaa",
        isDir: true,
        isFile: false,
      },
      {
        name: "01_rigidbody",
        path: "output/01_rigidbody",
        isDir: true,
        isFile: false,
      },
      {
        name: "02_caprieval",
        path: "output/02_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "03_clustfcc",
        path: "output/03_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "04_seletopclusts",
        path: "output/04_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "05_caprieval",
        path: "output/05_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "06_flexref",
        path: "output/06_flexref",
        isDir: true,
        isFile: false,
      },
      {
        name: "07_caprieval",
        path: "output/07_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "08_emref",
        path: "output/08_emref",
        isDir: true,
        isFile: false,
      },
      {
        name: "09_caprieval",
        path: "output/09_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "10_emscoring",
        path: "output/10_emscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "11_clustfcc",
        path: "output/11_clustfcc",
        isDir: true,
        isFile: false,
      },
      {
        name: "12_seletopclusts",
        path: "output/12_seletopclusts",
        isDir: true,
        isFile: false,
      },
      {
        name: "13_caprieval",
        path: "output/13_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "14_mdscoring",
        path: "output/14_mdscoring",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval",
        path: "output/15_caprieval",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive",
        path: "output/15_caprieval_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "15_caprieval_interactive_interactive_interactive",
        path: "output/15_caprieval_interactive_interactive_interactive",
        isDir: true,
        isFile: false,
      },
      {
        name: "analysis",
        path: "output/analysis",
        isDir: true,
        isFile: false,
      },
      {
        name: "data",
        path: "output/data",
        isDir: true,
        isFile: false,
      },
      {
        name: "log",
        path: "output/log",
        isDir: false,
        isFile: true,
      },
      {
        name: "traceback",
        path: "output/traceback",
        isDir: true,
        isFile: false,
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
