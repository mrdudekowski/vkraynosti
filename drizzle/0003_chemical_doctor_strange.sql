ALTER TABLE "tour_departures" ADD COLUMN "published_starts_on" date;--> statement-breakpoint
ALTER TABLE "tour_departures" ADD COLUMN "published_seats" integer;--> statement-breakpoint
ALTER TABLE "tour_departures" ADD COLUMN "published_status" "departure_status";