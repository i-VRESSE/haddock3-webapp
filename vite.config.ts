/// <reference types="vitest" />
import "dotenv/config";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

const isStorybook = process.argv[1]?.includes("storybook");
const isTestEnv = process.env.VITEST;

const prefix = process.env.HADDOCK3WEBAPP_PREFIX || "/";
const remixConfig = {
  basename: prefix,
};

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  base: prefix,
  plugins: [!(isStorybook || isTestEnv) && remix(remixConfig), tsconfigPaths()],
  test: {
    environment: "happy-dom",
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*"],
    coverage: {
      provider: "v8",
    },
  },
});
