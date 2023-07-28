import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { FormStrategy } from "remix-auth-form";
import { json } from "@remix-run/node";

import { sessionStorage } from "./session.server";
import {
  type TokenLessUser,
  getUserById,
  isSubmitAllowed,
  localLogin,
  oauthregister,
} from "./models/user.server";

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
      // TODO fetch verified email not just first email
      const primaryEmail = profile.emails[0].value;
      const userId = await oauthregister(primaryEmail);
      return userId;
    }
  );

  authenticator.use(gitHubStrategy);
}

export async function mustBeAuthenticated(request: Request) {
  const userId = await authenticator.isAuthenticated(request);
  if (userId === null) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

export async function getOptionalUser(request: Request) {
  const userId = await authenticator.isAuthenticated(request);
  if (userId === null) {
    return null;
  }
  return await getUserById(userId);
}

export async function getUser(request: Request) {
  const user = await getOptionalUser(request);
  if (!user) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function getOptionalClientUser(
  request: Request
): Promise<null | TokenLessUser> {
  const user = await getOptionalUser(request);
  if (!user) {
    return null;
  }
  const { bartenderToken, bartenderTokenExpiresAt, ...tokenLessUser } = user;
  return tokenLessUser;
}

export async function mustBeAdmin(request: Request) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    throw json("Forbidden, not admin", { status: 403 });
  }
}

export async function mustBeAllowedToSubmit(request: Request) {
  const user = await getUser(request);
  if (!isSubmitAllowed(user.preferredExpertiseLevel)) {
    throw json({ error: "Submit not allowed" }, { status: 403 });
  }
  return user;
}
