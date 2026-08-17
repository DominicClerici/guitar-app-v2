ALTER TABLE "user" ADD COLUMN "skill_level" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "goals" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "marketing_emails" boolean DEFAULT false NOT NULL;