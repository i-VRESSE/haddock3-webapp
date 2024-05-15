import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { PORTALCOOKIENAME, inPortalMode } from "~/portal.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO csb frontend does not have logout route so clear the cookie
  if (inPortalMode) {
    // TODO check if this works
    return redirect("/", {
      headers: {
        "Set-Cookie": `${PORTALCOOKIENAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`,
      },
    });
  }
  await authenticator.logout(request, { redirectTo: "/login" });
}
