import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import {
  getUserById,
  localLogin,
  oauthregister,
  verifyIsAdmin,
} from "./models/user.server";
import { json } from "@remix-run/node";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<string>(sessionStorage, {
  throwOnError: true,
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");
    if (
      email === null ||
      password == null ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      // TODO use zod for validation
      throw new Error("Email and password must be filled.");
    }
    const user = await localLogin(email, password);
    return user.id;
  }),
  "user-pass"
);

if (
  process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID &&
  process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET
) {
  let gitHubStrategy = new GitHubStrategy(
    {
      clientID: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET!,
      callbackURL:
        process.env.HADDOCK3WEBAPP_GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback",
    },
    async ({ profile }) => {
      // TODO store photo or avatar so it can be displayed in NavBar
      const primaryEmail = profile.emails[0].value;
      const userId = await oauthregister(primaryEmail);
      return userId;
    }
  );

  authenticator.use(gitHubStrategy);
}

export async function getUser(request: Request) {
  const userId = await authenticator.isAuthenticated(request);
  if (userId === null) {
    return null;
  }
  const user = await getUserById(userId);
  return user;
}

export async function mustBeAdmin(request: Request) {
  const userId = await authenticator.isAuthenticated(request);
  if (userId === null) {
    throw json("Unauthorized", { status: 401 });
  }
  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    throw json("Forbidden", { status: 403 });
  }
}
