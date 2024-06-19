import { Authenticator, type StrategyVerifyCallback } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import {
  type OAuth2Profile,
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import { json } from "@remix-run/node";
import { email, object, parse, string, pipe } from "valibot";

import { sessionStorage } from "./session.server";
import {
  type TokenLessUser,
  getUserById,
  isSubmitAllowed,
  localLogin,
  oauthregister,
  User,
  portalregister,
  UserNotFoundError,
  setPreferredExpertiseLevel,
} from "./models/user.server";
import {
  CsbUser,
  getOptionalPortalUser,
  inPortalMode,
  mapPermissions,
} from "./portal.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<number>(sessionStorage, {
  throwOnError: true,
});

const CredentialsSchema = object({
  email: pipe(string(), email()),
  password: string(),
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const { email, password } = parse(
      CredentialsSchema,
      Object.fromEntries(form),
    );
    const user = await localLogin(email, password);
    return user.id;
  }),
  "user-pass",
);

// remix-auth-github is not compatible with the remix v2
// TODO uncomment when it is fixed
// /**
//  * The super class GitHubStrategy returns emails that are not verified.
//  * This subclass filters out unverified emails.
//  */
// class GitHubStrategyWithVerifiedEmail extends GitHubStrategy<string> {
//   // From https://github.com/sergiodxa/remix-auth-github/blob/75cedd281b58523c5d3db5f7bbe92218cb733c46/src/index.ts#L197
//   protected async userEmails(accessToken: string): Promise<GitHubEmails> {
//     // url & agent are private to super class so we have to copy them here
//     const userEmailsURL = "https://api.github.com/user/emails";
//     const userAgent = "Haddock3WebApp";
//     const response = await fetch(userEmailsURL, {
//       headers: {
//         Accept: "application/vnd.github.v3+json",
//         Authorization: `token ${accessToken}`,
//         "User-Agent": userAgent,
//       },
//     });

//     const data: {
//       email: string;
//       verified: boolean;
//       primary: boolean;
//       visibility: string;
//     }[] = await response.json();
//     const emails: GitHubEmails = data
//       .filter((e) => e.verified)
//       .map(({ email }) => ({ value: email }));
//     return emails;
//   }
// }

// if (
//   process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID &&
//   process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET
// ) {
//   const gitHubStrategy = new GitHubStrategyWithVerifiedEmail(
//     {
//       clientID: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID,
//       clientSecret: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET,
//       callbackURL:
//         process.env.HADDOCK3WEBAPP_GITHUB_CALLBACK_URL ||
//         "http://localhost:3000/auth/github/callback",
//       userAgent: "Haddock3WebApp",
//     },
//     async ({ profile }) => {
//       // TODO store users display name in database for more personal greeting
//       const primaryEmail = profile.emails[0].value;
//       const photo = profile.photos[0].value ?? undefined;
//       const userId = await oauthregister(primaryEmail, photo);
//       return userId;
//     }
//   );

//   authenticator.use(gitHubStrategy);
// }

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
      >,
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
        verify,
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
        },
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
      const profileResponse = await fetch(this.profileEndpoint, {
        headers,
      });
      const profile = await profileResponse.json();
      const emails = await this.userEmails(profile.sub);
      // TODO store Orcid id into database
      return {
        ...profile,
        emails,
      };
    }
  }

  const orcidStrategy = new OrcidStrategy(
    {
      clientID: process.env.HADDOCK3WEBAPP_ORCID_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_ORCID_CLIENT_SECRET,
      callbackURL:
        process.env.HADDOCK3WEBAPP_ORCID_CALLBACK_URL ||
        "http://localhost:3000/auth/orcid/callback",
      isSandBox: !!process.env.HADDOCK3WEBAPP_ORCID_SANDBOX,
    },
    async ({ profile }) => {
      const primaryEmail = profile.emails![0].value;
      const photo = profile.photos ? profile.photos![0].value : undefined;
      const userId = await oauthregister(primaryEmail, photo);
      return userId;
    },
  );

  authenticator.use(orcidStrategy);
}

if (inPortalMode) {
  // Disable all strategies in portal mode
  // portal mode bypasses the authenticator
  authenticator.unuse("user-pass");
  authenticator.unuse("egi");
  authenticator.unuse("github");
  authenticator.unuse("orcid");
}

async function mergeUser(csbUser: CsbUser, webappUser: User): Promise<User> {
  const { isAdmin, expertiseLevels, preferredExpertiseLevel } = mapPermissions(
    csbUser.permissions,
  );
  const user = {
    ...webappUser,
    id: csbUser.id,
    email: csbUser.email,
    isAdmin,
    expertiseLevels,
  };
  if (!user.preferredExpertiseLevel && preferredExpertiseLevel) {
    user.preferredExpertiseLevel = preferredExpertiseLevel;
  }
  if (
    user.preferredExpertiseLevel !== null &&
    !expertiseLevels.includes(user.preferredExpertiseLevel)
  ) {
    // If user no longer has the level they prefer then pick one from available levels
    await setPreferredExpertiseLevel(user.id, preferredExpertiseLevel);
    user.preferredExpertiseLevel = preferredExpertiseLevel;
  }
  return user;
}

export async function getOptionalUser(request: Request) {
  if (inPortalMode) {
    const csbUser = await getOptionalPortalUser(request);
    if (!csbUser) {
      return null;
    }
    if (csbUser.suspended) {
      throw json({ error: "Suspended" }, { status: 403 });
    }
    try {
      const webappUser = await getUserById(csbUser.id);
      return await mergeUser(csbUser, webappUser);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        // New user from the portal sync them with the webapp
        const webappUser = await portalregister(csbUser.id, csbUser.email);
        return await mergeUser(csbUser, webappUser);
      }
    }
  }
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
  request: Request,
): Promise<null | TokenLessUser> {
  const user = await getOptionalUser(request);
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    preferredExpertiseLevel: user.preferredExpertiseLevel,
    expertiseLevels: user.expertiseLevels,
    photo: user.photo,
  };
}

export async function mustBeAdmin(request: Request) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    throw json({ error: "Forbidden, not admin" }, { status: 403 });
  }
}

export async function mustBeAllowedToSubmit(request: Request) {
  const user = await getUser(request);
  if (!isSubmitAllowed(user.preferredExpertiseLevel ?? "")) {
    throw json({ error: "Submit not allowed" }, { status: 403 });
  }
  return user;
}
