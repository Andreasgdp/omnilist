import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { listItems, listMembers, lists, listViews, workspaceMembers } from "@/db/schema";
import { parseListQueryState } from "@/features/lists/lib/query-state";
import { requireListAccess } from "@/features/lists/server/access";
import { buildItemSchema, listSchemaDefinitionSchema } from "@/shared/lib/list-schema";

const compareValues = (left: unknown, right: unknown) => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
};

const applyQueryState = ({
  items,
  queryState,
}: {
  items: Array<{ id: string; data: Record<string, unknown> }>;
  queryState: ReturnType<typeof parseListQueryState>;
}) => {
  let filtered = items;

  for (const filter of queryState.filters) {
    filtered = filtered.filter((item) => {
      const value = item.data[filter.field];
      const normalized = typeof value === "string" || typeof value === "number" ? String(value) : "";

      switch (filter.op) {
        case "contains":
          return normalized.toLowerCase().includes(filter.value.toLowerCase());
        case "equals":
          return normalized === filter.value;
        case "gt":
          return Number(value) > Number(filter.value);
        case "lt":
          return Number(value) < Number(filter.value);
      }
    });
  }

  if (queryState.sortField) {
    filtered = [...filtered].sort((left, right) => {
      const direction = queryState.sortDir === "desc" ? -1 : 1;
      return compareValues(left.data[queryState.sortField!], right.data[queryState.sortField!]) * direction;
    });
  }

  return filtered;
};

export const getListsForWorkspace = async ({
  workspaceId,
  userId,
}: {
  workspaceId: string;
  userId: string;
}) => {
  const rows = await db.query.lists.findMany({
    where: eq(lists.workspaceId, workspaceId),
    orderBy: [desc(lists.updatedAt)],
  });

  const memberships = await db.query.listMembers.findMany({
    where: eq(listMembers.userId, userId),
  });

  const sharedListIds = new Set(memberships.map((membership) => membership.listId));

  return rows.filter(
    (list) => list.visibility === "workspace" || list.ownerId === userId || sharedListIds.has(list.id),
  );
};

export const getListDetail = async ({
  listId,
  userId,
  workspaceId,
  searchParams,
}: {
  listId: string;
  userId: string;
  workspaceId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const workspaceMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId),
    ),
  });

  if (!workspaceMembership) {
    return null;
  }

  const access = await requireListAccess({
    listId,
    userId,
    workspaceId,
    workspaceRole: workspaceMembership.role,
  });

  const fields = listSchemaDefinitionSchema.parse(access.list.schema);
  const itemSchema = buildItemSchema(fields);
  const rawItems = await db.query.listItems.findMany({
    where: eq(listItems.listId, listId),
    orderBy: [desc(listItems.updatedAt)],
  });
  const views = await db.query.listViews.findMany({
    where: and(eq(listViews.listId, listId), eq(listViews.userId, userId)),
    orderBy: [desc(listViews.updatedAt)],
  });
  const queryState = parseListQueryState(searchParams ?? {});
  const items = applyQueryState({
    items: rawItems,
    queryState,
  });

  return {
    ...access,
    fields,
    itemSchema,
    items,
    queryState,
    views,
  };
};
