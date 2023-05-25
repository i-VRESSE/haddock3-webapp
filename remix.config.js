const { mountRoutes } = require("remix-mount-routes");

const basePath = process.env.REMIX_BASEPATH ?? "";

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  publicPath: `${basePath}/build/`,
  assetsBuildDirectory: `public${basePath}/build`,
  tailwind: true,
  routes: () => mountRoutes(basePath, "routes"),
};
