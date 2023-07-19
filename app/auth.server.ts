import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { localLogin } from "./models/user.server";
import { db } from "./utils/db.server";


export interface User {
    id: string
    email: string
    // TODO add bartender token generated for this user
    // TODO verify email
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage, {
    throwOnError: true,
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");
    if (email === null || password == null || typeof email !== "string" || typeof password !== 'string') {
        // TODO use zod for validation
        throw new Error('Email and password must be filled.')
    }
    return await localLogin(email, password);
  }),
  "user-pass"
);


if (process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID && process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET) {

  let gitHubStrategy = new GitHubStrategy(
    {
      clientID: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_ID,
      clientSecret: process.env.HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.HADDOCK3WEBAPP_GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback",
    },
    async ({ accessToken, extraParams, profile }) => {
      console.log({
        accessToken,
        extraParams,
        profile,
      })
      // TODO fetch if user exists
      await db.oAUthAccount.create({
        data: {
          provider: 'github',
          accessToken: accessToken,
          refreshToken: '',
          expiresAt: new Date(extraParams.accessTokenExpiresIn! * 1000),
          user: {
            create: {
                email: profile.emails[0].value,
            }
          }
        }
      });
      return {
        id: profile.id,
        email: profile.emails[0].value,
      }
    }
  );

  authenticator.use(gitHubStrategy);
}
