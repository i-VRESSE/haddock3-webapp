import { createCookie } from "@remix-run/node";
import { decodeJwt } from "jose";

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week
});

export async function getAccessToken(request: Request) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await userPrefs.parse(cookieHeader)) || {};
    const access_token: string | undefined = cookie.access_token
    return access_token
}

export function isExpired(accessToken: string | undefined) {
  const payload = getTokenPayload(accessToken)
  const now = Date.now() / 1000
  return (payload.exp !== undefined && payload.exp <= now)
}

export function getTokenPayload(accessToken: string | undefined) {
  if (accessToken === undefined) {
    return {};
  }
  // TODO verify token by using HS256 algorithm
  return decodeJwt(accessToken)
}