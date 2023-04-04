/**
 * Functions dealing with access token of bartender web service.
 */
import { decodeJwt } from "jose";
import { getSession } from "./session.server";

export async function getAccessToken(request: Request) {
  const session = await getSession(request);
  return session.data.bartenderToken;
}

export function isExpired(accessToken: string | undefined) {
  const payload = getTokenPayload(accessToken);
  const now = Date.now() / 1000;
  return payload.exp !== undefined && payload.exp <= now;
}

export function getTokenPayload(accessToken: string | undefined) {
  if (accessToken === undefined) {
    return {};
  }
  // TODO verify token by using HS256 algorithm,
  // see https://github.com/i-VRESSE/bartender/issues/58
  return decodeJwt(accessToken);
}
