import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";

export const workspaceRoleEnum = pgEnum("workspace_role", ["admin", "member"]);

export const workspaces = pgTable(
  "workspaces",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    planTier: text("plan_tier").notNull().default("free"),
    subscriptionStatus: text("subscription_status").notNull().default("inactive"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex("workspaces_slug_idx").on(table.slug),
  }),
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    membershipIndex: uniqueIndex("workspace_members_workspace_user_idx").on(table.workspaceId, table.userId),
    userIndex: index("workspace_members_user_idx").on(table.userId),
  }),
);

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  creator: one(users, {
    fields: [workspaces.createdBy],
    references: [users.id],
  }),
  members: many(workspaceMembers),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));
