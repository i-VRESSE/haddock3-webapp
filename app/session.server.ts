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
    secrets: [process.env.SESSION_SECRET || "somebadsecret"],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// export const themeSessionStorage = createCookieSessionStorage({
//   cookie: {
//     name: COOKIE_NAME + "_theme",
//     httpOnly: true,
//     path: "/",
//     sameSite: "lax",
//     maxAge: 604_800, // one week
//     secrets: [process.env.SESSION_SECRET || "somebadsecret"],
//     secure: process.env.NODE_ENV === "production",
//   },
// });
export const themeSessionStorage = sessionStorage;

export const themeSessionResolver =
  createThemeSessionResolver(themeSessionStorage);
