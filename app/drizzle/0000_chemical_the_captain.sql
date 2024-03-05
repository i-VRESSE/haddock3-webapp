DO $$ BEGIN
 CREATE TYPE "expertiseLevel" AS ENUM('easy', 'expert', 'guru');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"bartenderToken" text DEFAULT '' NOT NULL,
	"bartenderTokenExpiresAt" integer DEFAULT 0 NOT NULL,
	-- manually changed expertiseLevel to "expertiseLevel"
	-- manullay added default value as .default([]) does do anything
	"expertiseLevels" "expertiseLevel"[] DEFAULT '{}' NOT NULL,
	"preferredExpertiseLevel" "expertiseLevel",
	"photo" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
