import { describe, it, expect, afterEach} from 'vitest';
import { render } from "@testing-library/react";
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

import { ListReportFiles } from "./ListReportFiles";
import type { DirectoryItem } from '~/bartender-client';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});


describe("ListReportFiles", () => {
    it("renders a list of report files", () => {
        const files: DirectoryItem = {
            name: "root",
            path: "",
            isDir: true,
            isFile: false,
            children: [
                {
                    name: "analysis",
                    path: "analysis",
                    isDir: true,
                    isFile: false,
                    children: [
                        {
                            name: "module1",
                            path: "analysis/module1",
                            isDir: true,
                            isFile: false,
                            children: [
                                { name: "report.html", path: "analysis/module1/report.html", isDir: false, isFile: true },
                            ],
                        },
                        {
                            name: "module2",
                            path: "analysis/module2",
                            isDir: true,
                            isFile: false,
                            children: [
                                { name: "report.html", path: "analysis/module2/report.html", isDir: false, isFile: true },
                            ],
                        },
                    ],
                },
            ],
        };
        const prefix = "https://example.com/";
        const { getByText } = render(
            <ListReportFiles files={files} prefix={prefix} />
        );
        expect(getByText("module1")).toHaveAttribute(
            "href",
            "https://example.com/analysis/module1/report.html"
        );
        expect(getByText("module2")).toHaveAttribute(
            "href",
            "https://example.com/analysis/module2/report.html"
        );
    });

    it("renders a module with no report.html file", () => {
        const files: DirectoryItem = {
            name: "root",
            path: "",
            isDir: true,
            isFile: false,
            children: [
                {
                    name: "analysis",
                    path: "analysis",
                    isDir: true,
                    isFile: false,
                    children: [
                        {
                            name: "module1",
                            path: "analysis/module1",
                            isDir: true,
                            isFile: false,
                            children: [],
                        },
                    ],
                },
            ],
        };
        const prefix = "https://example.com/";
        const { queryByText,  } = render(
            <ListReportFiles files={files} prefix={prefix} />
        );
        expect(queryByText("module1")).toBeFalsy()
    });

    it("renders correctly when analysis has no children", () => {
        const files: DirectoryItem = {
            name: "root",
            path: "",
            isDir: true,
            isFile: false,
            children: [
                {
                    name: "analysis",
                    path: "analysis",
                    isDir: true,
                    isFile: false,
                },
            ],
        };
        const prefix = "https://example.com/";
        const { queryByText } = render(
            <ListReportFiles files={files} prefix={prefix} />
        );
        expect(queryByText("analysis")).toBeFalsy();
    });
    
    it("renders correctly when root has no children", () => {
        const files: DirectoryItem = {
            name: "root",
            path: "",
            isDir: true,
            isFile: false,
        };
        const prefix = "https://example.com/";
        const { queryByText } = render(
            <ListReportFiles files={files} prefix={prefix} />
        );
        expect(queryByText("analysis")).toBeFalsy();
    });
});


