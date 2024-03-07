import type { Config } from "drizzle-kit";
import { resolve } from "node:path";
export default {
  driver: "pg",
  out: "./app/drizzle",
  schema: [resolve(__dirname, "./app/drizzle/schema.server.ts")],
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ?? "<Please set DATABASE_URL env var>",
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config;
