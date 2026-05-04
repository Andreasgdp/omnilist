import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { listItems, listMembers, lists, workspaceMembers } from "@/db/schema";
import { requireListAccess } from "@/features/lists/server/access";
import { buildItemSchema, listSchemaDefinitionSchema } from "@/shared/lib/list-schema";

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
}: {
  listId: string;
  userId: string;
  workspaceId: string;
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
  const items = await db.query.listItems.findMany({
    where: eq(listItems.listId, listId),
    orderBy: [desc(listItems.updatedAt)],
  });

  return {
    ...access,
    fields,
    itemSchema,
    items,
  };
};
