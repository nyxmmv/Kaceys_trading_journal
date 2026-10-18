ALTER TABLE `entries` ADD `r_multiple` real;--> statement-breakpoint
ALTER TABLE `entries` ADD `mae_r` real;--> statement-breakpoint
ALTER TABLE `entries` ADD `mfe_r` real;--> statement-breakpoint
ALTER TABLE `entries` ADD `setup_grade` text DEFAULT 'Not graded' NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `followed_plan` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `fomo` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `session` text DEFAULT 'Not set' NOT NULL;--> statement-breakpoint
ALTER TABLE `entries` ADD `tags` text DEFAULT '[]' NOT NULL;