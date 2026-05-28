CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`first_name` varchar(80) NOT NULL,
	`last_name` varchar(80) NOT NULL,
	`email` varchar(191) NOT NULL,
	`phone` varchar(32),
	`password_hash` varchar(255) NOT NULL,
	`role` enum('customer','barber','admin') NOT NULL,
	`email_verified` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `barbers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`specialty` varchar(120),
	`bio` text,
	`avatar_url` varchar(500),
	`rating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`review_count` int NOT NULL DEFAULT 0,
	`status` enum('active','on_leave','inactive') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `barbers_id` PRIMARY KEY(`id`),
	CONSTRAINT `barbers_user_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `barber_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barber_id` int NOT NULL,
	`day_of_week` tinyint NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`is_working` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `barber_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `barber_sched_unique` UNIQUE(`barber_id`,`day_of_week`)
);
--> statement-breakpoint
CREATE TABLE `barber_time_off` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barber_id` int NOT NULL,
	`start_date` varchar(10) NOT NULL,
	`end_date` varchar(10) NOT NULL,
	`reason` varchar(500),
	`status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`reviewed_at` timestamp,
	`reviewed_by` int,
	CONSTRAINT `barber_time_off_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`category` varchar(80),
	`price_cents` int NOT NULL,
	`duration_minutes` int NOT NULL,
	`is_active` tinyint NOT NULL DEFAULT 1,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(24) NOT NULL,
	`customer_id` int NOT NULL,
	`barber_id` int NOT NULL,
	`service_id` int NOT NULL,
	`start_at` timestamp NOT NULL,
	`end_at` timestamp NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'confirmed',
	`payment_method` enum('online','counter') NOT NULL DEFAULT 'counter',
	`payment_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`price_cents` int NOT NULL,
	`notes` text,
	`cancelled_at` timestamp,
	`cancelled_by` int,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`booking_id` int NOT NULL,
	`transaction_id` varchar(64) NOT NULL,
	`amount_cents` int NOT NULL,
	`method` enum('online','counter') NOT NULL,
	`status` enum('succeeded','failed','refunded') NOT NULL DEFAULT 'succeeded',
	`card_last4` varchar(4),
	`processed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_tx_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(16) NOT NULL,
	`type` enum('email_verify','password_reset') NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `verification_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`email` varchar(191) NOT NULL,
	`phone` varchar(32),
	`subject` varchar(200),
	`message` text NOT NULL,
	`is_read` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int,
	`booking_id` int,
	`customer_name` varchar(120) NOT NULL,
	`rating` tinyint NOT NULL,
	`comment` text NOT NULL,
	`service_name` varchar(120),
	`is_published` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`booking_id` int,
	`channel` enum('sms','email') NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`subject` varchar(255),
	`body` text NOT NULL,
	`provider` varchar(32) NOT NULL DEFAULT 'console',
	`status` enum('sent','failed','queued') NOT NULL DEFAULT 'sent',
	`error` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_counters` (
	`year` int NOT NULL,
	`value` int NOT NULL DEFAULT 0,
	CONSTRAINT `booking_counters_year` PRIMARY KEY(`year`)
);
--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `barbers_status_idx` ON `barbers` (`status`);--> statement-breakpoint
CREATE INDEX `time_off_barber_idx` ON `barber_time_off` (`barber_id`,`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `services_active_idx` ON `services` (`is_active`);--> statement-breakpoint
CREATE INDEX `bookings_barber_time_idx` ON `bookings` (`barber_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE INDEX `bookings_customer_idx` ON `bookings` (`customer_id`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `payments_booking_idx` ON `payments` (`booking_id`);--> statement-breakpoint
CREATE INDEX `vt_user_type_idx` ON `verification_tokens` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `reviews_published_idx` ON `reviews` (`is_published`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `notifications` (`created_at`);