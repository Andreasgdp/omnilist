ALTER TABLE "list_views" ADD COLUMN "is_favorite" text DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE "list_views" ADD COLUMN "is_default" text DEFAULT 'false' NOT NULL;