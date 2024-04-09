import createOpenAPIClient from "openapi-fetch";

import type { components, paths } from "./schema";

export const client = createOpenAPIClient<paths>({
  baseUrl: "/api/h3restraints",
});

export type HTTPValidationError = components["schemas"]["HTTPValidationError"];
