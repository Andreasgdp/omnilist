import { relations } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";
import { listItems } from "@/db/schema/lists";
import { workspaces } from "@/db/schema/workspaces";

export const assetKindEnum = pgEnum("asset_kind", ["image", "file"]);
export const assetStatusEnum = pgEnum("asset_status", ["pending", "ready", "deleted"]);

export const assets = pgTable(
  "assets",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    uploadedBy: text("uploaded_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: assetKindEnum("kind").notNull(),
    provider: text("provider").notNull().default("s3"),
    bucket: text("bucket"),
    objectKey: text("object_key").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    status: assetStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workspaceIndex: index("assets_workspace_idx").on(table.workspaceId),
  }),
);

export const itemAssets = pgTable(
  "item_assets",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id").notNull().references(() => listItems.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    assetId: text("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    itemIndex: index("item_assets_item_idx").on(table.itemId),
  }),
);

export const assetsRelations = relations(assets, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [assets.workspaceId],
    references: [workspaces.id],
  }),
  uploader: one(users, {
    fields: [assets.uploadedBy],
    references: [users.id],
  }),
  itemAssets: many(itemAssets),
}));

export const itemAssetsRelations = relations(itemAssets, ({ one }) => ({
  item: one(listItems, {
    fields: [itemAssets.itemId],
    references: [listItems.id],
  }),
  asset: one(assets, {
    fields: [itemAssets.assetId],
    references: [assets.id],
  }),
}));
