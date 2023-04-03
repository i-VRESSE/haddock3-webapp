import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { oauthCallback } from "~/models/user.server";
import { commitSession, setSession } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const provider = params.provider || "";

  const url = new URL(request.url);
  const access_token = await oauthCallback(provider, url.searchParams);
  const session = await setSession(access_token, request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
