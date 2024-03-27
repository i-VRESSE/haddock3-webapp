import createOpenAPIClient from "openapi-fetch";

import type { paths } from "./schema";

export const client = createOpenAPIClient<paths>({
  baseUrl: "/api/h3restraints",
});
