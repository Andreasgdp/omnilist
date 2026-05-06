DROP INDEX "list_items_list_idx";--> statement-breakpoint
ALTER TABLE "list_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
WITH ordered_items AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "list_id" ORDER BY "updated_at" DESC, "id") - 1 AS row_number
  FROM "list_items"
)
UPDATE "list_items"
SET "sort_order" = ordered_items.row_number
FROM ordered_items
WHERE "list_items"."id" = ordered_items."id";--> statement-breakpoint
CREATE INDEX "list_items_list_idx" ON "list_items" USING btree ("list_id","sort_order","updated_at");
