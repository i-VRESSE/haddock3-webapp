import { describe, it, expect } from "vitest";

import { files2modules } from "./OutputReport";
import type { DirectoryItem } from "~/bartender-client/types";

describe("files2modules", () => {
  it("should return empty array if no children", () => {
    const item: DirectoryItem = {
      name: "",
      path: "",
      children: [],
      is_dir: true,
      is_file: false,
    };
    expect(files2modules(item)).toEqual([]);
  });

  it.each([["analysis"], ["data"], ["log"]])(
    "should ignore %s as module",
    (thing: string) => {
      const item: DirectoryItem = {
        name: "",
        path: "",
        children: [
          {
            name: thing,
            path: thing,
            children: [],
            is_dir: true,
            is_file: false,
          },
        ],
        is_dir: true,
        is_file: false,
      };
      expect(files2modules(item)).toEqual([]);
    },
  );

  it("should split child dir into module id and name", () => {
    const item: DirectoryItem = {
      name: "",
      path: "",
      children: [
        {
          name: "1_module",
          path: "1_module",
          children: [],
          is_dir: true,
          is_file: false,
        },
      ],
      is_dir: true,
      is_file: false,
    };
    const expected = [
      {
        id: "1",
        name: "module",
        output: item.children![0],
        report: undefined,
      },
    ];
    expect(files2modules(item)).toEqual(expected);
  });

  it("should find report.html", () => {
    const item: DirectoryItem = {
      name: "",
      path: "",
      children: [
        {
          name: "1_module",
          path: "",
          children: [],
          is_dir: true,
          is_file: false,
        },
        {
          name: "analysis",
          path: "",
          children: [
            {
              name: "1_module_analysis",
              path: "analsis/1_module_analysis",
              children: [
                {
                  name: "report.html",
                  path: "analsis/1_module_analysis/report.html",
                  children: [],
                  is_dir: false,
                  is_file: true,
                },
              ],
              is_dir: true,
              is_file: false,
            },
          ],
          is_dir: true,
          is_file: false,
        },
      ],
      is_dir: true,
      is_file: false,
    };
    const expected = [
      {
        id: "1",
        name: "module",
        output: item.children![0],
        report: {
          name: "report.html",
          path: "analsis/1_module_analysis/report.html",
          children: [],
          is_dir: false,
          is_file: true,
        },
      },
    ];
    expect(files2modules(item)).toEqual(expected);
  });
});
