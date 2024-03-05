import "dotenv/config";
import { conn, db } from "./db.server";
import { migrate } from "drizzle-orm/postgres-js/migrator";
(async () => {
  // This command run all migrations from the migrations folder and apply changes to the database
  await migrate(db, { migrationsFolder: "./app/drizzle" });
  await conn.end();
})();
