CREATE TABLE `prayers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`prayer_request` text NOT NULL,
	`category` text NOT NULL,
	`is_anonymous` integer DEFAULT false,
	`prayer_count` integer DEFAULT 0,
	`is_answered` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
