import { describe, test, expect } from "vitest";
import { getPreviousCaprievalModule } from "./shared";
import type { DirectoryItem } from "~/bartender-client/types";

describe("getPreviousCaprievalModule()", () => {
  test("should reutrn the previous caprieval module", () => {
    const files: DirectoryItem = {
      name: "output",
      is_dir: true,
      is_file: false,
      path: "/output",
      children: [
        {
          name: "00_caprieval",
          is_dir: true,
          is_file: false,
          path: "/output/00_caprieval",
          children: [],
        },
        {
          name: "01_rmsdmatrix",
          is_dir: true,
          is_file: false,
          path: "/output/01_rmsdmatrix",
          children: [],
        },
        {
          name: "02_clustrmsd",
          is_dir: true,
          is_file: false,
          path: "/output/02_clustrmsd",
          children: [],
        },
      ],
    };
    const caprievalIndex = getPreviousCaprievalModule(files, 2, 0);
    expect(caprievalIndex).toBe(0);
  });

  test("should throw an error if no caprieval module is found", () => {
    const files: DirectoryItem = {
      name: "output",
      is_dir: true,
      is_file: false,
      path: "/output",
      children: [
        {
          name: "00_rmsdmatrix",
          is_dir: true,
          is_file: false,
          path: "/output/00_rmsdmatrix",
          children: [],
        },
        {
          name: "01_clustrmsd",
          is_dir: true,
          is_file: false,
          path: "/output/01_clustrmsd",
          children: [],
        },
      ],
    };
    expect(() => getPreviousCaprievalModule(files, 1, 0)).toThrow();
  });
});
