# Portal mode

The portal mode is used to integrate the webapp within the [BonvinLab computational stuctural biology portal](https://www.bonvinlab.org/).

By default the webapp runs in standalone mode, meaning registration, login and user management is done by the webapp.

In portal mode the webapp hands that responsiblity of the the portal and its backend.
Also the header and footer similar to the portal will be shown.

To steps to render a non-anomyous page in the webapp are

1. check if there is a cookie set for the portal
2. if not redirect to the portal login page
3. if set then use the cookie to get the user information from the portal backend
4. combines portal user info with the webapp user info

The portal mode can be enabled by setting the `HADDOCK3WEBAPP_CSB_PORTAL` environment variable to a thruthy value like `1`.
The portal expects the haddock3 webapp to be running on a subpath of the portal, so the `HADDOCK3WEBAPP_PREFIX` environment variable should be set to something like `/haddock30`. The portal backend location should be set with `HADDOCK3WEBAPP_CSB_PORTAL_BACKEND` environment variable.

## Mock portal

The mock portal has the same endpoints as the real portal that are needed for haddock3 webapp, but those endpoints have very simply layout and mocked logic. A visitor is always logged in as someone@example.com user with all the rights.

Start the mock portal with:

```shell
npx tsx app/mock_portal.ts
```

Run webapp in another terminal with:

```shell
export HADDOCK3WEBAPP_PREFIX=/haddock30/
export HADDOCK3WEBAPP_CSB_PORTAL=true
export HADDOCK3WEBAPP_CSB_PORTAL_BACKEND=http://localhost:8180/api
npm run build
npm start
```

Goto http://0.0.0.0:8000/haddock30/ for webapp.
Goto http://0.0.0.0:8000/new/login to login to the mock portal.
