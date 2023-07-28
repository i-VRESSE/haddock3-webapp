import { Authenticator } from "remix-auth";
import {
  type GitHubEmails,
  GitHubStrategy,
} from "remix-auth-github";
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

/**
 * The super class GitHubStrategy returns emails that are not verified.
 * This subclass filters out unverified emails.
 */
class GitHubStrategyWithVerifiedEmail extends GitHubStrategy<string> {
  // From https://github.com/sergiodxa/remix-auth-github/blob/75cedd281b58523c5d3db5f7bbe92218cb733c46/src/index.ts#L197
  protected async userEmails(accessToken: string): Promise<GitHubEmails> {
    // url & agent are private to super class so we have to copy them here
    const userEmailsURL = "https://api.github.com/user/emails";
    const userAgent = "Haddock3WebApp";
    let response = await fetch(userEmailsURL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
        "User-Agent": userAgent,
      },
    });

    let data: {
      email: string;
      verified: boolean;
      primary: boolean;
      visibility: string;
    }[] = await response.json();
    let emails: GitHubEmails = data
      .filter((e) => e.verified)
      .map(({ email }) => ({ value: email }));
    return emails;
  }
}

if (
  process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID &&
  process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET
) {
  let gitHubStrategy = new GitHubStrategyWithVerifiedEmail(
    {
      clientID: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET!,
      callbackURL:
        process.env.HADDOCK3WEBAPP_GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback",
      userAgent: "Haddock3WebApp",
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
