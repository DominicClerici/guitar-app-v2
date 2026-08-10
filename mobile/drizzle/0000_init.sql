CREATE TABLE `sync_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`user_is_anonymous` integer DEFAULT false NOT NULL,
	`cursor` integer DEFAULT 0 NOT NULL,
	`last_pulled_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`client_updated_at` integer NOT NULL,
	`server_seq` integer,
	`deleted_at` integer,
	PRIMARY KEY(`user_id`, `key`)
);
--> statement-breakpoint
CREATE INDEX `user_preferences_pull_idx` ON `user_preferences` (`user_id`,`server_seq`);