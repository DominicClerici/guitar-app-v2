CREATE TABLE `cached_chapters` (
	`pathway_slug` text NOT NULL,
	`chapter_id` text NOT NULL,
	`version` text NOT NULL,
	`fetched_at` integer NOT NULL,
	PRIMARY KEY(`pathway_slug`, `chapter_id`)
);
--> statement-breakpoint
CREATE TABLE `cached_curriculum` (
	`scope` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`body` text NOT NULL,
	`fetched_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cached_documents` (
	`slug` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`version` text NOT NULL,
	`body` text NOT NULL,
	`pathway_slug` text,
	`chapter_id` text,
	`fetched_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cached_documents_chapter_idx` ON `cached_documents` (`pathway_slug`,`chapter_id`);