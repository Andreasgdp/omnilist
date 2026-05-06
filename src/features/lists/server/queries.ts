import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { listItems, listMembers, lists, listViews, workspaceMembers } from "@/db/schema";
import { parseListQueryState } from "@/features/lists/lib/query-state";
import { requireListAccess } from "@/features/lists/server/access";
import { buildItemSchema, repairStoredListFields, type ListSchemaDefinition } from "@/shared/lib/list-schema";

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

const hydrateRelations = async ({
  fields,
  items,
}: {
  fields: ListSchemaDefinition;
  items: Array<{ id: string; data: Record<string, unknown> }>;
}) => {
  const relationFields = fields.filter((field) => field.type === "relation");

  if (relationFields.length === 0) {
    return {
      items,
      relatedById: {} as Record<string, { id: string; data: Record<string, unknown> }>,
    };
  }

  const ids = new Set<string>();
  for (const item of items) {
    for (const field of relationFields) {
      const rawValue = item.data[field.key];

      if (Array.isArray(rawValue)) {
        for (const value of rawValue) {
          if (typeof value === "string") {
            ids.add(value);
          }
        }
      } else if (typeof rawValue === "string") {
        ids.add(rawValue);
      }
    }
  }

  if (ids.size === 0) {
    return {
      items,
      relatedById: {} as Record<string, { id: string; data: Record<string, unknown> }>,
    };
  }

  const relatedItems = await db.query.listItems.findMany({
    where: inArray(listItems.id, [...ids]),
  });

  return {
    items,
    relatedById: Object.fromEntries(relatedItems.map((item) => [item.id, item])),
  };
};

const buildRelationOptions = async ({
  fields,
  workspaceId,
}: {
  fields: ListSchemaDefinition;
  workspaceId: string;
}) => {
  const relationFields = fields.filter((field) => field.type === "relation" && field.targetListId);

  if (relationFields.length === 0) {
    return {} as Record<string, Array<{ id: string; label: string }>>;
  }

  const targetListIds = [...new Set(relationFields.map((field) => field.targetListId!))];
  const targetLists = await db.query.lists.findMany({
    where: inArray(lists.id, targetListIds),
  });
  const targetItems = await db.query.listItems.findMany({
    where: inArray(
      listItems.listId,
      targetLists.filter((list) => list.workspaceId === workspaceId).map((list) => list.id),
    ),
    orderBy: [asc(listItems.sortOrder), desc(listItems.updatedAt)],
  });

  const itemsByListId = Object.groupBy(targetItems, (item) => item.listId);

  return Object.fromEntries(
    relationFields.map((field) => [
      field.key,
      (itemsByListId[field.targetListId!] ?? []).map((item) => ({
        id: item.id,
        label: String(item.data.title ?? item.data.name ?? "Untitled item"),
      })),
    ]),
  );
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

  const repairedSchema = repairStoredListFields(access.list.schema);
  const fields = repairedSchema.fields;

  if (repairedSchema.changed) {
    await db
      .update(lists)
      .set({
        schema: fields,
      })
      .where(and(eq(lists.id, listId), eq(lists.workspaceId, workspaceId)));
  }

  const itemSchema = buildItemSchema(fields);
  const rawItems = await db.query.listItems.findMany({
    where: eq(listItems.listId, listId),
    orderBy: [asc(listItems.sortOrder), desc(listItems.updatedAt)],
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
  const relations = await hydrateRelations({
    fields,
    items,
  });
  const relationOptions = await buildRelationOptions({
    fields,
    workspaceId,
  });

  return {
    ...access,
    fields,
    itemSchema,
    items: relations.items,
    relatedById: relations.relatedById,
    relationOptions,
    queryState,
    views,
  };
};
