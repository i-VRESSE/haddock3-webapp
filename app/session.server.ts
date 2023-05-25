import { createCookie, createFileSessionStorage } from "@remix-run/node";
import { getCurrentUser } from "./models/user.server";
import { url } from "./utils";

type SessionData = {
  bartenderToken: string;
  isSuperUser: boolean;
  roles: string[];
};

type SessionFlashData = {
  error: string;
};

const COOKIE_NAME = "bartended_haddock3_session";

const sessionCookie = createCookie(COOKIE_NAME, {
  // TODO add secret + domain + path
  sameSite: true,
  httpOnly: true,
  maxAge: 604_800, // one week
  path: url("/"),
  secrets: [process.env.SESSION_SECRET || "somebadsecret"],
  secure: process.env.NODE_ENV === "production",
});

const sessionStorage = createFileSessionStorage<SessionData, SessionFlashData>({
  cookie: sessionCookie,
  dir: "./sessions",
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return await sessionStorage.getSession(cookie);
}

export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;

export async function setSession(access_token: string, request: Request) {
  const session = await getSession(request);
  const user = await getCurrentUser(access_token);
  session.set("bartenderToken", access_token);
  session.set("isSuperUser", user.isSuperuser!);
  session.set("roles", user.roles ?? []);
  return session;
}
