/**
 * Unnest types from the OpenAPI schema
 */
import type { components } from "./bartenderschema";

export type JobModelDTO = components["schemas"]["JobModelDTO"];
export type DirectoryItem = components["schemas"]["DirectoryItem"];
export const CompletedJobs = new Set(["ok", "error"]);
