CREATE TABLE `pathway_enrollments` (
	`user_id` text NOT NULL,
	`pathway_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`last_active_at` integer NOT NULL,
	`client_updated_at` integer NOT NULL,
	`server_seq` integer,
	`deleted_at` integer,
	PRIMARY KEY(`user_id`, `pathway_id`)
);
--> statement-breakpoint
CREATE INDEX `pathway_enrollments_pull_idx` ON `pathway_enrollments` (`user_id`,`server_seq`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`attempt_id` text NOT NULL,
	`user_id` text NOT NULL,
	`section_id` text NOT NULL,
	`score_pct` integer NOT NULL,
	`passed` integer NOT NULL,
	`answered_at` integer NOT NULL,
	`server_seq` integer,
	`deleted_at` integer,
	PRIMARY KEY(`user_id`, `attempt_id`)
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_pull_idx` ON `quiz_attempts` (`user_id`,`server_seq`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_section_idx` ON `quiz_attempts` (`user_id`,`section_id`);--> statement-breakpoint
CREATE TABLE `section_progress` (
	`user_id` text NOT NULL,
	`section_id` text NOT NULL,
	`completed_at` integer,
	`best_score_pct` integer,
	`server_seq` integer,
	`deleted_at` integer,
	PRIMARY KEY(`user_id`, `section_id`)
);
--> statement-breakpoint
CREATE INDEX `section_progress_pull_idx` ON `section_progress` (`user_id`,`server_seq`);