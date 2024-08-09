import { type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { inPortalMode, logout } from "~/portal.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (inPortalMode) {
    return await logout(request);
  }
  await authenticator.logout(request, { redirectTo: "/login" });
}
