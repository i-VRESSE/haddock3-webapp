import { Authenticator, type StrategyVerifyCallback } from "remix-auth";
import { type GitHubEmails, GitHubStrategy } from "remix-auth-github";
import { FormStrategy } from "remix-auth-form";
import {
  type OAuth2Profile,
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import {
  type KeycloakExtraParams,
  KeycloakStrategy,
  type KeycloakProfile,
} from "remix-auth-keycloak";
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
  const gitHubStrategy = new GitHubStrategyWithVerifiedEmail(
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

if (
  process.env.HADDOCK3WEBAPP_ORCID_CLIENT_ID &&
  process.env.HADDOCK3WEBAPP_ORCID_CLIENT_SECRET
) {
  interface OrcidOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    isSandBox: boolean;
  }

  class OrcidStrategy<User> extends OAuth2Strategy<User, OAuth2Profile> {
    name = "orcid";
    private profileEndpoint: string;
    private emailsEndpoint: string;
    constructor(
      options: OrcidOptions,
      verify: StrategyVerifyCallback<
        User,
        OAuth2StrategyVerifyParams<OAuth2Profile>
      >
    ) {
      const domain = options.isSandBox ? "sandbox.orcid.org" : "orcid.org";
      const AUTHORIZE_ENDPOINT = `https://${domain}/oauth/authorize`;
      const ACCESS_TOKEN_ENDPOINT = `https://${domain}/oauth/token`;
      const PROFILE_ENDPOINT = `https://${domain}/oauth/userinfo`;
      const EMAILS_ENDPOINT = `https://pub.${domain}/v3.0/{id}/email`;
      super(
        {
          clientID: options.clientID,
          clientSecret: options.clientSecret,
          callbackURL: options.callbackURL,
          authorizationURL: AUTHORIZE_ENDPOINT,
          tokenURL: ACCESS_TOKEN_ENDPOINT,
        },
        verify
      );
      this.profileEndpoint = PROFILE_ENDPOINT;
      this.emailsEndpoint = EMAILS_ENDPOINT;
    }

    protected authorizationParams() {
      return new URLSearchParams({
        scope: "openid",
      });
    }

    protected async userEmails(orcid: string) {
      const emailsResponse = await fetch(
        this.emailsEndpoint.replace("{id}", orcid),
        {
          headers: {
            Accept: "application/orcid+json",
          },
        }
      );
      const emails: { email: { email: string }[] } =
        await emailsResponse.json();
      if (!emails.email) {
        throw new Error("No public email found.");
      }
      return emails.email.map((e) => ({ value: e.email }));
    }

    protected async userProfile(accessToken: string): Promise<OAuth2Profile> {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const profileResponse = await fetch(this.profileEndpoint, { headers });
      const profile = await profileResponse.json();
      const emails = await this.userEmails(profile.sub);
      return {
        ...profile,
        emails,
      };
    }
  }

  const orcidStrategy = new OrcidStrategy(
    {
      clientID: process.env.HADDOCK3WEBAPP_ORCID_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_ORCID_CLIENT_SECRET!,
      callbackURL:
        process.env.HADDOCK3WEBAPP_ORCID_CALLBACK_URL ||
        "http://localhost:3000/auth/orcid/callback",
      isSandBox: !!process.env.HADDOCK3WEBAPP_ORCID_SANDBOX,
    },
    async ({ profile }) => {
      const primaryEmail = profile.emails![0].value;
      const userId = await oauthregister(primaryEmail);
      return userId;
    }
  );

  authenticator.use(orcidStrategy);
}

if (
  process.env.HADDOCK3WEBAPP_EGI_CLIENT_ID &&
  process.env.HADDOCK3WEBAPP_EGI_CLIENT_SECRET
) {
  interface EgiOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    environment: "production" | "development" | "demo";
  }

  class EgiStrategy<User> extends KeycloakStrategy<User> {
    name = "egi";

    constructor(
      options: EgiOptions,
      verify: StrategyVerifyCallback<
        User,
        OAuth2StrategyVerifyParams<KeycloakProfile, KeycloakExtraParams>
      >
    ) {
      const domain = {
        production: "aai.egi.eu/auth",
        development: "aai-dev.egi.eu/auth",
        demo: "aai-demoegi.eu/auth",
      }[options.environment];
      super(
        {
          clientID: options.clientID,
          clientSecret: options.clientSecret,
          callbackURL: options.callbackURL,
          domain,
          realm: "egi",
          useSSL: true,
        },
        verify
      );
    }
  }

  const egiStrategy = new EgiStrategy(
    {
      clientID: process.env.HADDOCK3WEBAPP_EGI_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_EGI_CLIENT_SECRET!,
      callbackURL:
        process.env.HADDOCK3WEBAPP_EGI_CALLBACK_URL ||
        "http://localhost:3000/auth/egi/callback",
      environment:
        (process.env.HADDOCK3WEBAPP_EGI_ENVIRONMENT as
          | "development"
          | "production"
          | "demo") || "production",
    },
    async ({ profile }) => {
      const primaryEmail = profile.emails![0].value;
      const userId = await oauthregister(primaryEmail);
      return userId;
    }
  );

  authenticator.use(egiStrategy);
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
  if (!isSubmitAllowed(user.preferredExpertiseLevel ?? "")) {
    throw json({ error: "Submit not allowed" }, { status: 403 });
  }
  return user;
}
