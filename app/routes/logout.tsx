import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";
import { url } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  return redirect(url("/"), {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
