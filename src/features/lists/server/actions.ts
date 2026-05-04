"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db/client";
import { listItems, listMembers, lists, workspaceMembers } from "@/db/schema";
import { requireApprovedSession } from "@/features/auth/server/guard";
import { requireListAccess } from "@/features/lists/server/access";
import { buildItemSchema, listSchemaDefinitionSchema } from "@/shared/lib/list-schema";
import { canEditList, canShareRole, compareListRoles } from "@/shared/lib/permissions";
import { routes } from "@/shared/lib/routes";

const createId = () => crypto.randomUUID();

const listInputSchema = z.object({
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  visibility: z.enum(["private", "workspace"]),
  schema: z.string(),
});

export const createListAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = listInputSchema.parse(Object.fromEntries(formData));
  const fields = listSchemaDefinitionSchema.parse(JSON.parse(input.schema));

  const workspaceMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, input.workspaceId),
      eq(workspaceMembers.userId, session.user.id),
    ),
  });

  if (!workspaceMembership) {
    throw new Error("Workspace access denied");
  }

  const listId = createId();

  await db.insert(lists).values({
    id: listId,
    workspaceId: input.workspaceId,
    ownerId: session.user.id,
    name: input.name,
    description: input.description,
    visibility: input.visibility,
    schema: fields,
  });

  await db.insert(listMembers).values({
    id: createId(),
    listId,
    userId: session.user.id,
    role: "owner",
    grantedBy: session.user.id,
  });

  revalidatePath(routes.workspaceLists(input.workspaceSlug));
  redirect(routes.list(input.workspaceSlug, listId));
};

const itemInputSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  payload: z.string(),
});

export const createItemAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = itemInputSchema.parse(Object.fromEntries(formData));

  const workspaceMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, input.workspaceId),
      eq(workspaceMembers.userId, session.user.id),
    ),
  });

  if (!workspaceMembership) {
    throw new Error("Workspace access denied");
  }

  const access = await requireListAccess({
    listId: input.listId,
    userId: session.user.id,
    workspaceId: input.workspaceId,
    workspaceRole: workspaceMembership.role,
  });

  if (!canEditList(access.role)) {
    throw new Error("List edit access denied");
  }

  const payload = JSON.parse(input.payload) as Record<string, unknown>;
  const fields = listSchemaDefinitionSchema.parse(access.list.schema);
  const itemSchema = buildItemSchema(fields);
  const data = itemSchema.parse(payload);

  await db.insert(listItems).values({
    id: createId(),
    listId: input.listId,
    createdBy: session.user.id,
    updatedBy: session.user.id,
    data,
  });

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};

const shareListSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  targetUserId: z.string().uuid(),
  role: z.enum(["editor", "viewer"]),
});

export const shareListAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = shareListSchema.parse(Object.fromEntries(formData));

  const workspaceMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, input.workspaceId),
      eq(workspaceMembers.userId, session.user.id),
    ),
  });

  if (!workspaceMembership) {
    throw new Error("Workspace access denied");
  }

  const access = await requireListAccess({
    listId: input.listId,
    userId: session.user.id,
    workspaceId: input.workspaceId,
    workspaceRole: workspaceMembership.role,
  });

  if (!canShareRole(access.role, input.role)) {
    throw new Error("You cannot grant that role");
  }

  const existing = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, input.listId), eq(listMembers.userId, input.targetUserId)),
  });

  if (existing) {
    if (compareListRoles(existing.role, input.role) !== 0) {
      await db
        .update(listMembers)
        .set({ role: input.role, grantedBy: session.user.id, grantedAt: new Date() })
        .where(eq(listMembers.id, existing.id));
    }
  } else {
    await db.insert(listMembers).values({
      id: createId(),
      listId: input.listId,
      userId: input.targetUserId,
      role: input.role,
      grantedBy: session.user.id,
    });
  }

  revalidatePath(routes.listShare(input.workspaceSlug, input.listId));
};
