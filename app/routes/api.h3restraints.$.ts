import { LoaderFunctionArgs } from "@remix-run/node";
import { mustBeAllowedToSubmit } from "~/auth.server";

const HADDOCK3_RESTRAINTS_URL =
  process.env.HADDOCK3_RESTRAINTS_URL ?? "http://localhost:5000";

// Reversze proxy requests to the Haddock3 Restraints web service
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const path = params["*"] || "";
  const { search } = new URL(request.url);
  await mustBeAllowedToSubmit(request);
  const url = new URL(`${HADDOCK3_RESTRAINTS_URL}/${path}${search}`);
  const newRequest = new Request(url, {
    method: request.method,
    body: request.body,
    // TODO sanitize headers, Accept, Content-* should be enough
    headers: request.headers,
  });
  // remix fetch is decompressing the response by default, as we want to reverse proxy we need to disable it
  // also tsc does not know that remix is using a custom fetch implementation so we need to cast the init to RequestInit
  const init = { compress: false } as RequestInit;
  return fetch(newRequest, init);
};

export const action = loader;
