import createOpenAPIClient from "openapi-fetch";

import type { components, paths } from "./schema";
import { prefix } from "~/prefix";

export const client = createOpenAPIClient<paths>({
  baseUrl: `${prefix}api/h3restraints`,
});

export type HTTPValidationError = components["schemas"]["HTTPValidationError"];
