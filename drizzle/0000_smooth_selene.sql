CREATE TABLE `flooded_areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`barangay` text NOT NULL,
	`area_description` text NOT NULL,
	`severity` text DEFAULT 'Moderate' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`name` text NOT NULL,
	`type` text DEFAULT 'Other' NOT NULL,
	`severity` text DEFAULT '🟢 Normal' NOT NULL,
	`location` text NOT NULL,
	`barangay` text DEFAULT 'Unknown' NOT NULL,
	`latitude` real,
	`longitude` real,
	`status` text DEFAULT 'Reported' NOT NULL,
	`responding_unit` text DEFAULT 'None' NOT NULL,
	`casualties_dead` integer DEFAULT 0 NOT NULL,
	`casualties_injured` integer DEFAULT 0 NOT NULL,
	`casualties_missing` integer DEFAULT 0 NOT NULL,
	`evacuated_families` integer DEFAULT 0 NOT NULL,
	`evacuated_individuals` integer DEFAULT 0 NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`call_taker` text DEFAULT 'Unknown' NOT NULL,
	`responder` text DEFAULT 'Unknown' NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `personnel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`agency` text NOT NULL,
	`deployed` integer DEFAULT 0 NOT NULL,
	`available` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `preparedness` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'daily' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`closed_at` integer
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer,
	`waterway_name` text NOT NULL,
	`level_meters` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Normal' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `water_rescue_equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`deployed` integer DEFAULT 0 NOT NULL
);
