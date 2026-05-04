CREATE TABLE "list_views" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_views" ADD CONSTRAINT "list_views_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_views" ADD CONSTRAINT "list_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "list_views_list_user_idx" ON "list_views" USING btree ("list_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "list_views_list_user_name_idx" ON "list_views" USING btree ("list_id","user_id","name");