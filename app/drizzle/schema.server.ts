import {
  pgTable,
  pgEnum,
  timestamp,
  text,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

export const expertiseLevel = pgEnum("expertise_level", [
  "easy",
  "expert",
  "guru",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  bartenderToken: text("bartender_token").default("").notNull(),
  bartenderTokenExpiresAt: integer("bartender_token_expires_at")
    .default(0)
    .notNull(),
  expertiseLevels: expertiseLevel("expertise_levels")
    .array()
    .default([])
    .notNull(),
  preferredExpertiseLevel: expertiseLevel("preferred_expertise_level"),
  photo: text("photo").notNull(),
});

export type ExpertiseLevel = NonNullable<
  typeof users.$inferSelect.preferredExpertiseLevel
>;
