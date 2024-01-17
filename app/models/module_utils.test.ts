import { describe, test, expect } from "vitest";
import { hasInteractiveVersion } from "./module_utils";
import {
  outputFileWithoutInteractiveVersions,
  outputFileWithInteractiveVersion,
} from "./test.fixtures";

describe("hasInteractiveVersion", () => {
  test.each([
    [outputFileWithoutInteractiveVersions(), false],
    [outputFileWithInteractiveVersion(), true],
  ])("should return the number of interactive modules", (files, expected) => {
    const result = hasInteractiveVersion(15, files);
    expect(result).toEqual(expected);
  });
});
