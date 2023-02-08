import { createCookie } from "@remix-run/node";

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week
});

export async function getAccessToken(request: Request) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await userPrefs.parse(cookieHeader)) || {};
    const access_token: string | undefined = cookie.access_token
    return access_token
}

