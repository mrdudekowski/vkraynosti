ALTER TABLE "users" ADD COLUMN "can_publish_tours" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "can_publish_schedule" boolean DEFAULT false NOT NULL;