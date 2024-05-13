import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO csb frontend does not have logout route so clear the cookie
  if (process.env.HADDOCK3WEBAPP_CSB_AUTH) {
    // TODO check if this works
    return redirect("/", {
      headers: {
        "Set-Cookie":
          "bonvinlab_auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict",
      },
    });
  }
  await authenticator.logout(request, { redirectTo: "/login" });
}
