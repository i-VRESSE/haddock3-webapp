# Authentication & authorization

- [Authentication \& authorization](#authentication--authorization)
  - [Session](#session)
  - [Social logins](#social-logins)
  - [GitHub login](#github-login)
  - [Orcid sandbox login](#orcid-sandbox-login)
  - [Orcid login](#orcid-login)
  - [EGI Check-in login](#egi-check-in-login)

A user can only submit jobs when he/she is logged in and has at least one expertise level.
A super user can assign an expertise level to users at http://localhost:3000/admin/users.
A super user can be made through the admin page (`/admin/users`) or by being the first registered user.

## Session

The sessions will be encrypted with a secret key from an environment variable.

```shell
SESSION_SECRET=...
```
(A random string can be generated with `openssl rand -base64 32`)

The environment variables can be stored in a `.env` file.

Use [.env.example](../.env.example) as a template:

```shell
cp .env.example .env
```

## Social logins

To enable GitHub or Orcid or EGI Check-in login the web app needs following environment variables.

```shell
HADDOCK3WEBAPP_GITHUB_CLIENT_ID=...
HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET=...
HADDOCK3WEBAPP_GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
HADDOCK3WEBAPP_ORCID_CLIENT_ID=...
HADDOCK3WEBAPP_ORCID_CLIENT_SECRET=...
HADDOCK3WEBAPP_ORCID_CALLBACK_URL=http://localhost:3000/auth/orcid/callback
HADDOCK3WEBAPP_ORCID_SANDBOX=1 # optional, if unset uses Orcid production
HADDOCK3WEBAPP_EGI_CLIENT_ID=...
HADDOCK3WEBAPP_EGI_CLIENT_SECRET=...
HADDOCK3WEBAPP_EGI_CALLBACK_URL=http://localhost:3000/auth/egi/callback
HADDOCK3WEBAPP_EGI_ENVIRONMENT=production  # could also be 'development' or 'demo'
```

Only use social logins where the email address has been verified. 
Otherwise someone could create an social account with your email address and impersonate you.

## GitHub login

The web app can be configured to login with your
[GitHub](https://gibhub.com) account.

To enable perform following steps:

1. Create a GitHub app

   1. Goto <https://github.com/settings/apps/new>
   2. Set Homepage URL to `http://localhost:8000/`
   3. Set Callback URL to `http://localhost:8000/auth/github/callback`
   4. Check `Request user authorization (OAuth) during installation`
   5. In Webhook section

      - Uncheck `Active`

   6. In User permissions section

      - Set `Email addresses` to `Read-only`

   7. Press `Create GitHub App` button
   8. After creation

      - Generate a new client secret
      - (Optionally) Restrict app to certain IP addresses

2. Append GitHub app credentials to `.env` file

   1. Add `HADDOCK3WEBAPP_GITHUB_CLIENT_ID=<Client id of GitHub app>`
   2. Add `HADDOCK3WEBAPP_GITHUB_CLIENT_SECRET=<Client secret of GitHub app>`
   3. (Optionally) Add `HADDOCK3WEBAPP_GITHUB_CALLBACK_URL=<URL>`, URL where GitHub should redirect to after login.

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

   - Only one app can be registered per orcid account, so use alternate account
     when primary account already has an registered app.

   - Your website URL does not allow localhost URL, so use
     `https://github.com/i-VRESSE/bartended-haddock3`

   - Redirect URI: for dev deployments set to
     `http://127.0.0.1:8000/auth/orcid/callback`.

3. Append Orcid sandbox app credentials to `.env` file

   1. Add `HADDOCK3WEBAPP_ORCID_SANDBOX=1` to use Orcid sandbox, if not set then uses Orcid production.
   1. Add `HADDOCK3WEBAPP_ORCID_CLIENT_ID=<Client id of Orcid sandbox app>`
   1. Add `HADDOCK3WEBAPP_ORCID_CLIENT_SECRET=<Client secret of Orcid sandbox app>`
   1. Add
      `HADDOCK3WEBAPP_ORCID_CALLBACK_URL=http://127.0.0.1:8000/auth/orcid/callback`, URL where Orcid should redirect to after login.

Orcid sandbox does not like `localhost`, use `127.0.0.1` as hostname instead.

## Orcid login

The web app can be configured to login with your [Orcid](https://orcid.org/)
account.

Steps are similar to [Orcid sandbox login](#orcid-sandbox-login), but

- Unset `HADDOCK3WEBAPP_ORCID_SANDBOX` environment variable
- Callback URL must use **https** scheme
- Account emails don't have to be have be from `@mailinator.com` domain.

To host web app with https use a revserse proxy like [caddyserver](https://caddyserver.com/)

```
# Save as file called Caddyfile
{
  http_port 8081
}

<your hostname>:8443

reverse_proxy 127.0.0.1:3000

# If your hostname is not public then use issuer internal,
# otherwise remove tls block.
tls {
	issuer internal
}
```

```shell
caddy run
```

This will make app available on `https://<your hostname>:8443`.
In Orcid site set the redirect URL to `https://<your hostname>:8443/auth/callback/orcid`.

## EGI Check-in login

The web app can be configured to login with your [EGI Check-in](https://aai.egi.eu/)
account.

To enable perform following steps:

1. This web service needs to be [registered as a service provider in EGI Check-in](https://docs.egi.eu/providers/check-in/sp/).
   - Select protocol: OIDC Service
   - Callback should end with `/auth/egi/callback`
   - Callback should for non-developement environments use https
   - Disable PKCE, as the
     [library](https://github.com/sergiodxa/remix-auth-oauth2/issues/24)
     used for authentication does support PKCE
2. Append EGI SP credentials to `.env` file
   1. Add `HADDOCK3WEBAPP_EGI_CLIENT_ID=<Client id of EGI SP>`
   2. Add `HADDOCK3WEBAPP_EGI_CLIENT_SECRET=<Client secret of EGI SP>`
   3. (Optionally) Add which integration environment the SP is using,
      `HADDOCK3WEBAPP_EGI_ENVIRONMENT=<production|development|demo>`,
      defaults to `production`
   4. (Optionally) Add external URL of app
      `HADDOCK3WEBAPP_EGI_REDIRECT_URL=<URL>`
