CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`firm` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'Challenge' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`account_size` real,
	`starting_balance` real,
	`archived` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_accounts_archived` ON `accounts` (`archived`);--> statement-breakpoint
CREATE INDEX `idx_accounts_name` ON `accounts` (`name`);--> statement-breakpoint
ALTER TABLE `entries` ADD `account_id` text REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `entries` ADD `risk_amount` real;--> statement-breakpoint
ALTER TABLE `entries` ADD `net_pnl` real;--> statement-breakpoint
CREATE INDEX `idx_entries_account` ON `entries` (`account_id`);