import { describe, test, expect } from "vitest";

import { buildPath } from "./job.server";

describe("buildPath()", () => {
  test.each([
    [{ moduleIndex: 1, moduleName: "caprieval" }, "output/01_caprieval/"],
    [{ moduleIndex: 15, moduleName: "caprieval" }, "output/15_caprieval/"],
    [
      { moduleIndex: 1, moduleName: "caprieval", isInteractive: true },
      "output/01_caprieval_interactive/",
    ],
  ])("should return the correct path", (input, expected) => {
    const result = buildPath({ ...input, moduleIndexPadding: 2 });
    expect(result).toEqual(expected);
  });
});
