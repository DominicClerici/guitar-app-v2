CREATE TABLE "content_documents" (
	"slug" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"version" text NOT NULL,
	"body" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_pathways" (
	"slug" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"body" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
