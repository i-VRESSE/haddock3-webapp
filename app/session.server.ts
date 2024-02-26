import { readFileSync } from "node:fs";
import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

const COOKIE_NAME = "haddock3_webapp_session";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: COOKIE_NAME,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 604_800, // one week
    secrets: [
      process.env.SESSION_SECRET ||
        (process.env.SESSION_SECRET_FILE &&
          readFileSync(process.env.SESSION_SECRET_FILE).toString()) ||
        "somebadsecret",
    ],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
