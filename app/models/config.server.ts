import createOpenAPIClient from "openapi-fetch";

import type { paths } from "~/bartender-client/bartenderschema";

const DEFAULT_BARTENDER_API_URL = "http://127.0.0.1:8000";

export function multipart(body: Record<string, string | Blob>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(body)) {
    fd.append(k, v);
  }
  return fd;
}

export function createClient(accessToken: string, baseUrl = "") {
  return createOpenAPIClient<paths>({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    baseUrl:
      baseUrl || process.env["BARTENDER_API_URL"] || DEFAULT_BARTENDER_API_URL,
  });
}
