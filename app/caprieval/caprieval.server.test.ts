import { describe, test, expect } from "vitest";

import { getLastCaprievalModule } from "./caprieval.server";
import { outputFileWithoutInteractiveVersions } from "../models/test.fixtures";

describe("getLastCaprievalModule", () => {
  test("should return the last caprieval module", () => {
    const files = outputFileWithoutInteractiveVersions();
    const result = getLastCaprievalModule(files);
    const expected = [15, 2];
    expect(result).toEqual(expected);
  });
});
