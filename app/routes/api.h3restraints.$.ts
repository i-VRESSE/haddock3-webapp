import { LoaderFunctionArgs } from "@remix-run/node";
import { mustBeAllowedToSubmit } from "~/auth.server";

// TODO add service to deployment
// TODO make configurable via environment variable during build
const DEFAULT_H3_RESTRAINTS_API_URL = "http://localhost:5000";

// Proxy requests to the Haddock3 Restraints web service
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const path = params["*"] || "";
  await mustBeAllowedToSubmit(request);
  const url = `${DEFAULT_H3_RESTRAINTS_API_URL}/${path}`;
  const newRequest = new Request(url, {
    method: request.method,
    body: request.body,
  });
  return fetch(newRequest);
};

export const action = loader;
