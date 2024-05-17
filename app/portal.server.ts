import { boolean, email, number, object, string, parse, Output } from "valibot";
import { parse as parseCookie } from "cookie";
import { type ExpertiseLevel } from "./drizzle/schema.server";

export const inPortalMode = !!process.env.HADDOCK3WEBAPP_CSB_PORTAL;
export const PORTAL_COOKIE_NAME = "bonvinlab_auth_token";
export const PORTAL_BACKEND_URL =
  process.env.HADDOCK3WEBAPP_CSB_PORTAL_BACKEND ?? "http://backend:8180/api";

export function disabledInPortalMode() {
  if (inPortalMode) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
}
export const CsbUserSchema = object({
  id: number(),
  email: string([email()]),
  permissions: number(),
  suspended: boolean(),
});
export type CsbUser = Output<typeof CsbUserSchema>;

function getToken(request: Request) {
  const cookieString = request.headers.get("Cookie") || "";
  const cookies = parseCookie(cookieString);
  const csbToken = cookies[PORTAL_COOKIE_NAME];
  if (!csbToken) {
    throw new Error("Failed to validate token");
  }
  return csbToken;
}

function getPortalHeaders(request: Request) {
  const csbToken = getToken(request);
  return {
    headers: {
      Authorization: `Bearer ${csbToken}`,
    },
  };
}

export async function getPortalUser(request: Request) {
  const url = `${PORTAL_BACKEND_URL}/auth/validate`;
  const resp = await fetch(url, getPortalHeaders(request));
  if (!resp.ok) {
    throw new Error("Failed to validate token");
  }
  const rawCsbUser = await resp.json();
  const csbUser = parse(CsbUserSchema, rawCsbUser);
  if (csbUser.suspended) {
    throw new Error("Failed to validate token");
  }
  return csbUser;
}
export async function getOptionalPortalUser(request: Request) {
  try {
    return await getPortalUser(request);
  } catch (error) {
    return null;
  }
}

export function mapPermissions(perms: number) {
  const expertiseLevels: ExpertiseLevel[] = [];
  let preferredExpertiseLevel: ExpertiseLevel | null = null;
  if ((perms & 1) !== 0) {
    expertiseLevels.push("easy");
    preferredExpertiseLevel = "easy";
  }
  if ((perms & 2) !== 0) {
    expertiseLevels.push("expert");
    preferredExpertiseLevel = "expert";
  }
  if ((perms & 4) !== 0) {
    expertiseLevels.push("guru");
    preferredExpertiseLevel = "guru";
  }
  return {
    expertiseLevels,
    preferredExpertiseLevel,
    isAdmin: (perms & 32) !== 0,
  };
}

export async function logout(request: Request) {
  const url = `${PORTAL_BACKEND_URL}/auth/logout`;
  const backendResp = await fetch(url, getPortalHeaders(request));
  const cookie = backendResp.headers.get("Set-Cookie") ?? "";
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/",
      "Set-Cookie": cookie,
    }
  });
}
