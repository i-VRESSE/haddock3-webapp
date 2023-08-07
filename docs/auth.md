# Authentication & authorization

A user can only submit jobs when he/she is logged in and has at least one expertise level.
A super user can assign an expertise level to users at http://localhost:3000/admin/users.
A super user can be made through the admin page or by being the first registered user.

The sessions will be encrypted with a secret key from an environment variable.

```shell
SESSION_SECRET=...
```

The environment variables can also be stored in a `.env` file.

Use `.env.example` as a template:

```shell
cp .env.example .env
```

To enable GitHub or Orcid or EGI Check-in login the web apps needs following environment variables.

```shell
HADDOCK3WEBAPP_GITHUB_CLIENT_ID=...
HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET=...
HADDOCK3WEBAPP_GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
HADDOCK3WEBAPP_ORCID_CLIENT_ID=...
HADDOCK3WEBAPP_ORCID_CLIENT_SECRET=...
HADDOCK3WEBAPP_ORCID_CALLBACK_URL=http://localhost:3000/auth/orcid/callback
HADDOCK3WEBAPP_ORCID_SANDBOX='something'  # When env var is set then sandbox is used instead of production
HADDOCK3WEBAPP_EGI_CLIENT_ID=...
HADDOCK3WEBAPP_EGI_CLIENT_SECRET=...
HADDOCK3WEBAPP_EGI_CALLBACK_URL=http://localhost:3000/auth/egi/callback
HADDOCK3WEBAPP_EGI_ENVIRONMENT=production  # could also be 'development' or 'demo'
```

Only use social logins where the email address has been verified.

### GitHub

The web app can be configured to login with your
[GitHub](https://gibhub.com) account.

To enable perform following steps:

1. Create a GitHub app

   1. Goto <https://github.com/settings/apps/new>
   2. Set Homepage URL to `http://localhost:8000/`
   3. Set Callback URL to `http://localhost:8000/auth/github/callback`
   4. Check `Request user authorization (OAuth) during installation`
   5. In Webhook section

      * Uncheck `Active`

   6. In User permissions section

      * Set `Email addresses` to `Read-only`

   7. Press `Create GitHub App` button
   8. After creation

      * Generate a new client secret
      * (Optionally) Restrict app to certain IP addresses

2. Append GitHub app credentials to `.env` file

   1. Add `HADDOCK3WEBAPP_GITHUB_CLIENT_ID=<Client id of GitHub app>`
   2. Add `HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET=<Client secret of GitHub app>`
   3. (Optionally) Add external URL of app
      `HADDOCK3WEBAPP_GITHUB_REDIRECT_URL=<URL>`

## Orcid sandbox login

The web app can be configured to login with your [Orcid
sandbox](https://sandbox.orcid.org/) account.

To enable perform following steps:

1. Create Orcid account for yourself

   1. Go to [https://sandbox.orcid.org/](https://sandbox.orcid.org/)

      Use `<something>@mailinator.com` as email, because to register app you
      need a verified email and Orcid sandbox only sends mails to
      `mailinator.com`.

   2. Go to
      [https://www.mailinator.com/v4/public/inboxes.jsp](https://www.mailinator.com/v4/public/inboxes.jsp)

      Search for `<something>` and verify your email address

   3. Go to [https://sandbox.orcid.org/account](https://sandbox.orcid.org/account)

      Make email public for everyone

2. Create application

   Goto
   [https://sandbox.orcid.org/developer-tools](https://sandbox.orcid.org/developer-tools)
   to register app.

   * Only one app can be registered per orcid account, so use alternate account
     when primary account already has an registered app.

   * Your website URL does not allow localhost URL, so use
     `https://github.com/i-VRESSE/bartended-haddock3`

   * Redirect URI: for dev deployments set to
     `http://localhost:8000/auth/orcidsandbox/callback`

3. Append Orcid sandbox app credentials to `.env` file

   1. Add `HADDOCK3WEBAPP_ORCIDSANDBOX_CLIENT_ID=<Client id of Orcid sandbox app>`
   2. Add `HADDOCK3WEBAPP_ORCIDSANDBOX_CLIENT_SECRET=<Client secret of Orcid sandbox
      app>`
   3. (Optionally) Add external URL of app
      `HADDOCK3WEBAPP_ORCIDSANDBOX_REDIRECT_URL=<URL>`

The `GET /api/users/profile` route will return the Orcid ID in
`oauth_accounts[oauth_name=sandbox.orcid.org].account_id`.

## Orcid login

The web app can be configured to login with your [Orcid](https://orcid.org/)
account.

Steps are similar to [Orcid sandbox login](#orcid-sandbox-login), but

* Callback URL must use **https** scheme
* Account emails don't have to be have be from `@mailinator.com` domain.
* In steps

  * Replace `https://sandbox.orcid.org/` with `https://orcid.org/`
  * In redirect URL replace `orcidsandbox` with `orcid`.
  * In `.env` replace `_ORCIDSANDBOX_` with `_ORCID_`

## EGI Check-in login

The web app can be configured to login with your [EGI Check-in](https://aai.egi.eu/)
account.

To enable perform following steps:

1. This web service needs to be [registered as a service provider in EGI Check-in](https://docs.egi.eu/providers/check-in/sp/).
   * Select protocol: OIDC Service
   * Callback should end with `/auth/egi/callback`
   * Callback should for non-developement environments use https
   * Disable PKCE, as the
     [Python library](https://github.com/fastapi-users/fastapi-users)
     used for authentication does support PKCE
2. Append EGI SP credentials to `.env` file
    1. Add `HADDOCK3WEBAPP_EGI_CLIENT_ID=<Client id of EGI SP>`
    2. Add `HADDOCK3WEBAPP_EGI_CLIENT_SECRET=<Client secret of EGI SP>`
    3. (Optionally) Add which integration environment the SP is using,
        `HADDOCK3WEBAPP_EGI_ENVIRONMENT=<production|development|demo>`
    4. (Optionally) Add external URL of app
        `HADDOCK3WEBAPP_EGI_REDIRECT_URL=<URL>`