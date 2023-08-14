import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const provider = params.provider || "";
  return authenticator.authenticate(provider, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
  // TODO when auth fails, show message to user
};
