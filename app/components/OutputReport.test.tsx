import { describe, it, expect } from "vitest";

import type { DirectoryItem } from "~/bartender-client";
import { files2modules } from "./OutputReport";

describe("files2modules", () => {
  it("should return empty array if no children", () => {
    const item: DirectoryItem = {
      name: "",
      path: "",
      children: [],
      isDir: true,
      isFile: false,
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
            isDir: true,
            isFile: false,
          },
        ],
        isDir: true,
        isFile: false,
      };
      expect(files2modules(item)).toEqual([]);
    }
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
          isDir: true,
          isFile: false,
        },
      ],
      isDir: true,
      isFile: false,
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
          isDir: true,
          isFile: false,
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
                  isDir: false,
                  isFile: true,
                },
              ],
              isDir: true,
              isFile: false,
            },
          ],
          isDir: true,
          isFile: false,
        },
      ],
      isDir: true,
      isFile: false,
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
          isDir: false,
          isFile: true,
        },
      },
    ];
    expect(files2modules(item)).toEqual(expected);
  });
});
