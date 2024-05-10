/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

const isStorybook = process.argv[1]?.includes("storybook");
const isTestEnv = process.env.VITEST;

export default defineConfig({
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [!(isStorybook || isTestEnv) && remix(), tsconfigPaths()],
  test: {
    environment: "happy-dom",
    include: ["./app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    watchExclude: [".*\\/node_modules\\/.*", ".*\\/build\\/.*"],
    coverage: {
      provider: "v8",
    },
  },
});
