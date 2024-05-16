import { SessionStorage } from "@remix-run/server-runtime";
import { boolean, email, number, object, string, parse, Output } from "valibot";
import { parse as parseCookie } from "cookie";
import { AuthenticateOptions, Strategy } from "remix-auth";
import { ExpertiseLevel } from "./drizzle/schema.server";

export const PORTALCOOKIENAME = "bonvinlab_auth_token";
export const inPortalMode = !!process.env.HADDOCK3WEBAPP_CSB_PORTAL;

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

export async function getPortalUser(request: Request) {
  // TODO get bonvinlab_auth_token cookie
  const cookieString = request.headers.get("Cookie") || "";
  const cookies = parseCookie(cookieString);
  const csbToken = cookies[PORTALCOOKIENAME];
  if (!csbToken) {
    throw new Error("Failed to validate token");
  }
  // TODO if there is cookie then call csb backend GET /api/auth/validate
  const resp = await fetch("http://backend:8180/api/auth/validate", {
    headers: {
      Authorization: `Bearer ${csbToken}`,
    },
  });
  // TODO backend response contains user info like
  // user_name, email, id, permissions bitmask 1=easy,2=expert,4=guru
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

export function mapPermissions(perms: number) {
  const levels: ExpertiseLevel[] = [];
  if ((perms & 1) !== 0) {
    levels.push("easy");
  }
  if ((perms & 2) !== 0) {
    levels.push("expert");
  }
  if ((perms & 4) !== 0) {
    levels.push("guru");
  }
  return {
    levels,
    admin: (perms & 32) !== 0,
  };
}

export interface PortalStrategyVerifyParams {
  /**
   * The request that triggered the authentication.
   */
  request: Request;
}

export class PortalStrategy extends Strategy<
  CsbUser,
  PortalStrategyVerifyParams
> {
  name = "portal";

  constructor() {
    super(({ request }) => getPortalUser(request));
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions,
  ): Promise<CsbUser> {
    try {
      const user = await this.verify({ request });
      return this.success(user, request, sessionStorage, options);
    } catch (error) {
      if (error instanceof Error) {
        return await this.failure(
          error.message,
          request,
          sessionStorage,
          options,
          error,
        );
      }
      return await this.failure(
        "Unknown error",
        request,
        sessionStorage,
        options,
        new Error(JSON.stringify(error, null, 2)),
      );
    }
  }
}
