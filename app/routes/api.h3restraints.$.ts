import { LoaderFunctionArgs } from "@remix-run/node";
import { mustBeAllowedToSubmit } from "~/auth.server";

const HADDOCK3_RESTRAINTS_URL =
  process.env.HADDOCK3_RESTRAINTS_URL ?? "http://localhost:5000";

// Proxy requests to the Haddock3 Restraints web service
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const path = params["*"] || "";
  await mustBeAllowedToSubmit(request);
  const url = `${HADDOCK3_RESTRAINTS_URL}/${path}`;
  const newRequest = new Request(url, {
    method: request.method,
    body: request.body,
  });
  return fetch(newRequest);
};

export const action = loader;
