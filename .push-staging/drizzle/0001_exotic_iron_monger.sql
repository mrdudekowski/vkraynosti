CREATE TYPE "public"."departure_status" AS ENUM('planned', 'open', 'full', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "tour_departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" varchar NOT NULL,
	"starts_on" date NOT NULL,
	"seats" integer NOT NULL,
	"status" "departure_status" DEFAULT 'open' NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"submitted_for_publish_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	CONSTRAINT "tour_departures_seats_positive" CHECK ("tour_departures"."seats" > 0)
);
--> statement-breakpoint
ALTER TABLE "tour_departures" ADD CONSTRAINT "tour_departures_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_departures" ADD CONSTRAINT "tour_departures_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tour_departures_active_tour_starts_on_uq" ON "tour_departures" USING btree ("tour_id","starts_on") WHERE "tour_departures"."status" <> 'cancelled';