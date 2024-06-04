import { describe, expect, test } from "vitest";
import { mapPermissions } from "./portal.server";

describe("mapPermissions()", () => {
  test.each([
    [0, { expertiseLevels: [], preferredExpertiseLevel: null, isAdmin: false }],
    [
      1,
      {
        expertiseLevels: ["easy"],
        preferredExpertiseLevel: "easy",
        isAdmin: false,
      },
    ],
    [
      2,
      {
        expertiseLevels: ["easy", "expert"],
        preferredExpertiseLevel: "expert",
        isAdmin: false,
      },
    ],
    [
      4,
      {
        expertiseLevels: ["easy", "expert", "guru"],
        preferredExpertiseLevel: "guru",
        isAdmin: false,
      },
    ],
    [
      32,
      {
        expertiseLevels: ["easy", "expert", "guru"],
        preferredExpertiseLevel: "guru",
        isAdmin: true,
      },
    ],
  ])("%i should return correct levels and isAdmin", (permissions, expected) => {
    const result = mapPermissions(permissions);
    expect(result).toEqual(expected);
  });
});
