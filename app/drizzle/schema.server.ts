import {
  pgTable,
  pgEnum,
  timestamp,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

export const expertiseLevel = pgEnum("expertiseLevel", [
  "easy",
  "expert",
  "guru",
]);

export const users = pgTable("users", {
  // TODO rename table columns CamelCase to under_scored?
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash"),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  bartenderToken: text("bartenderToken").default("").notNull(),
  bartenderTokenExpiresAt: integer("bartenderTokenExpiresAt")
    .default(0)
    .notNull(),
  expertiseLevels: expertiseLevel("expertiseLevels")
    .array()
    .default([])
    .notNull(),
  preferredExpertiseLevel: expertiseLevel("preferredExpertiseLevel"),
  photo: text("photo").notNull(),
});

export type ExpertiseLevel = NonNullable<
  typeof users.$inferSelect.preferredExpertiseLevel
>;
