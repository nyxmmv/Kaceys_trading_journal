CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`symbol` text NOT NULL,
	`side` text NOT NULL,
	`setup` text NOT NULL,
	`outcome` text NOT NULL,
	`idea` text NOT NULL,
	`review` text NOT NULL,
	`lessons` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entries_date` ON `entries` (`date`);