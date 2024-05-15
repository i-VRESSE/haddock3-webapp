# Portal mode

The portal mode is used to integrate the webapp within the [BonvinLab computational stuctural biology portal](https://www.bonvinlab.org/).

By default the webapp runs in standalone mode, meaning registration, login and user management is done by the webapp.

In portal mode the webapp hands that of the the portal and its backend.
Also the header and footer of the portal will be shown.

To use a non-anomyous page in the webapp the webapp will

1. check if there is a cookie set for the portal
2. if not redirect to the portal login page
3. if set then use the cookie to get the user information from the portal backend
4. combines portal user info with the webapp user info

The portal mode can be enabled by setting the `HADDOCK3WEBAPP_CSB_PORTAL` environment variable to a thruthy value like `1`.
