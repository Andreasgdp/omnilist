import { relations } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";
import { itemAssets } from "@/db/schema/assets";
import { workspaces } from "@/db/schema/workspaces";
import type { ListQueryState } from "@/features/lists/lib/query-state";
import type { FieldDefinition } from "@/shared/lib/list-schema";

export const listVisibilityEnum = pgEnum("list_visibility", ["private", "workspace"]);
export const listRoleEnum = pgEnum("list_role", ["owner", "editor", "viewer"]);

export const lists = pgTable(
  "lists",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    visibility: listVisibilityEnum("visibility").notNull().default("private"),
    schema: jsonb("schema").$type<FieldDefinition[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workspaceIndex: index("lists_workspace_idx").on(table.workspaceId, table.updatedAt),
  }),
);

export const listMembers = pgTable(
  "list_members",
  {
    id: text("id").primaryKey(),
    listId: text("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: listRoleEnum("role").notNull(),
    grantedBy: text("granted_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    membershipIndex: uniqueIndex("list_members_list_user_idx").on(table.listId, table.userId),
    userIndex: index("list_members_user_idx").on(table.userId),
  }),
);

export const listItems = pgTable(
  "list_items",
  {
    id: text("id").primaryKey(),
    listId: text("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
    createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    updatedBy: text("updated_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    listIndex: index("list_items_list_idx").on(table.listId, table.updatedAt),
  }),
);

export const listViews = pgTable(
  "list_views",
  {
    id: text("id").primaryKey(),
    listId: text("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isFavorite: text("is_favorite").notNull().default("false"),
    isDefault: text("is_default").notNull().default("false"),
    state: jsonb("state").$type<ListQueryState>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    listUserIndex: index("list_views_list_user_idx").on(table.listId, table.userId),
    uniqueNameIndex: uniqueIndex("list_views_list_user_name_idx").on(table.listId, table.userId, table.name),
  }),
);

export const listsRelations = relations(lists, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [lists.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [lists.ownerId],
    references: [users.id],
  }),
  members: many(listMembers),
  items: many(listItems),
  views: many(listViews),
}));

export const listMembersRelations = relations(listMembers, ({ one }) => ({
  list: one(lists, {
    fields: [listMembers.listId],
    references: [lists.id],
  }),
  user: one(users, {
    fields: [listMembers.userId],
    references: [users.id],
  }),
  granter: one(users, {
    fields: [listMembers.grantedBy],
    references: [users.id],
  }),
}));

export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  creator: one(users, {
    fields: [listItems.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [listItems.updatedBy],
    references: [users.id],
  }),
  assets: many(itemAssets),
}));

export const listViewsRelations = relations(listViews, ({ one }) => ({
  list: one(lists, {
    fields: [listViews.listId],
    references: [lists.id],
  }),
  user: one(users, {
    fields: [listViews.userId],
    references: [users.id],
  }),
}));
