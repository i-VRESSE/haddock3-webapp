import {
  createCookieSessionStorage,
} from "@remix-run/node";

const COOKIE_NAME = "haddock3_webapp_session";

export const sessionStorage = createCookieSessionStorage({
  // TODO add secret + domain + path
  cookie: {
    name: COOKIE_NAME,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 604_800, // one week
    secrets: [process.env.SESSION_SECRET || "somebadsecret"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
