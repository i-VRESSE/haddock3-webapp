import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { disabledInPortalMode } from "~/portal.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  disabledInPortalMode();
  const provider = params.provider || "";
  return authenticator.authenticate(provider, request, {
    successRedirect: "/",
    failureRedirect: "/login_failed",
    // use redirect rather than throw error
    // throwOnError: true
  });
};
