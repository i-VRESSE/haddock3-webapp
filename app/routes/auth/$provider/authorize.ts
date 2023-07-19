import type { ActionArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { authenticator } from "~/auth.server";

export const action = async ({ params, request }: ActionArgs) => {
  const provider = params.provider || "";
  return authenticator.authenticate(provider, request);
};
