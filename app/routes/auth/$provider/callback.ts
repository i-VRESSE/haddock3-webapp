import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "react-router";
import { userPrefs } from "~/cookies.server";
import { oauthCallback } from "~/models/user.server";

export const loader = async ({ request, params}: LoaderArgs) => {
    const provider = params.provider || ''

    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await userPrefs.parse(cookieHeader)) || {};

    const url = new URL(request.url)
    const access_token = await oauthCallback(provider, url.searchParams);
    cookie.access_token = access_token;
    return redirect("/", {
        headers: {
            "Set-Cookie": await userPrefs.serialize(cookie),
        },
    });
}