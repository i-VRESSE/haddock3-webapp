import { assert, describe, test } from "vitest";
import { parseFormData } from "./schema";
import {
  array,
  instance,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";

describe("parseFormData()", () => {
  test("should return single values", () => {
    const formData = new FormData();
    formData.append("key", "value");
    const schema = object({
      key: string(),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: "value" });
  });

  test("should return multiple values", () => {
    const formData = new FormData();
    formData.append("key", "value1");
    formData.append("key", "value2");
    const schema = object({
      key: array(string()),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: ["value1", "value2"] });
  });

  test("should work with a file", () => {
    const formData = new FormData();
    const file = new File(["content"], "filename.txt");
    formData.append("key", file);
    const schema = object({
      key: instance(File, "Must be a file"),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: file });
  });

  test("should work wit 2 files", () => {
    const formData = new FormData();
    const file = new File(["content"], "filename.txt");
    formData.append("key", file);
    const file2 = new File(["content"], "filename2.txt");
    formData.append("key", file2);
    const schema = object({
      key: union([
        pipe(
          instance(File, "Must be a file"),
          transform((v) => [v]),
        ),
        array(instance(File, "Must be a file")),
      ]),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: [file, file2] });
  });

  test("should ignore empty files", () => {
    const formData = new FormData();
    formData.append("key", "value");
    const file = new File([], "");
    formData.append("key2", file);
    const schema = object({
      key: string(),
      key2: optional(instance(File, "Must be a file")),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: "value" });
  });

  test("should work with a file as array", () => {
    const formData = new FormData();
    const file = new File(["content"], "filename.txt");
    formData.append("key", file);
    const schema = object({
      key: union([
        pipe(
          instance(File, "Must be a file"),
          transform((v) => [v]),
        ),
        array(instance(File, "Must be a file")),
      ]),
    });
    const result = parseFormData(formData, schema);
    assert.deepEqual(result, { key: [file] });
  });
});
