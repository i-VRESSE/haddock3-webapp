DO $$ BEGIN
 CREATE TYPE "expertise_level" AS ENUM('easy', 'expert', 'guru');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"bartender_token" text DEFAULT '' NOT NULL,
	"bartender_token_expires_at" integer DEFAULT 0 NOT NULL,
	"expertise_levels" expertise_level[] DEFAULT '{}' NOT NULL,
	"preferred_expertise_level" "expertise_level",
	"photo" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
