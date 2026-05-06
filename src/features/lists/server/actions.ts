"use server";

import { and, count, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db/client";
import { listItems, listMembers, lists, listViews, workspaceMembers } from "@/db/schema";
import { parseListQueryState } from "@/features/lists/lib/query-state";
import { requireApprovedSession } from "@/features/auth/server/guard";
import { requireListAccess } from "@/features/lists/server/access";
import { buildItemSchema, coreListFields, listSchemaDefinitionSchema, normalizeListFields, parseStoredListFields } from "@/shared/lib/list-schema";
import { canEditList, canShareRole, compareListRoles } from "@/shared/lib/permissions";
import { routes } from "@/shared/lib/routes";

const createId = () => crypto.randomUUID();

const createFieldKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";

const ensureUniqueFieldKey = (existingKeys: Set<string>, desiredKey: string) => {
  let nextKey = desiredKey;
  let suffix = 2;

  while (existingKeys.has(nextKey)) {
    nextKey = `${desiredKey}_${suffix}`;
    suffix += 1;
  }

  return nextKey;
};

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
  const fields = normalizeListFields(listSchemaDefinitionSchema.parse(JSON.parse(input.schema)));

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

const updateListSchema = listInputSchema.extend({
  listId: z.string().uuid(),
});

export const updateListAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = updateListSchema.parse(Object.fromEntries(formData));
  const fields = normalizeListFields(listSchemaDefinitionSchema.parse(JSON.parse(input.schema)));

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

  await db
    .update(lists)
    .set({
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      schema: fields,
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, input.listId), eq(lists.workspaceId, input.workspaceId)));

  revalidatePath(routes.workspaceLists(input.workspaceSlug));
  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listSettings(input.workspaceSlug, input.listId));
  redirect(routes.list(input.workspaceSlug, input.listId));
};

const quickAddFieldSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "boolean", "date", "url", "select", "image", "file", "document", "relation"]),
  targetListId: z.string().uuid().optional(),
});

export const quickAddFieldAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = quickAddFieldSchema.parse(Object.fromEntries(formData));

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

  const fields = parseStoredListFields(access.list.schema);
  const existingKeys = new Set(fields.map((field) => field.key));
  const nextField = {
    key: ensureUniqueFieldKey(existingKeys, createFieldKey(input.label)),
    label: input.label,
    type: input.type,
    required: false,
    ...(input.type === "select"
      ? {
          options: [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ],
        }
      : {}),
    ...(input.type === "relation" && input.targetListId
      ? {
          targetListId: input.targetListId,
        }
      : {}),
  };

  listSchemaDefinitionSchema.parse([nextField]);

  await db
    .update(lists)
    .set({
      schema: normalizeListFields([...fields, nextField]),
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, input.listId), eq(lists.workspaceId, input.workspaceId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listSettings(input.workspaceSlug, input.listId));
};

const saveFieldSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  originalKey: z.string().min(1),
  field: z.string(),
});

export const saveFieldAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = saveFieldSchema.parse(Object.fromEntries(formData));

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

  const fields = parseStoredListFields(access.list.schema);
  const fieldIndex = fields.findIndex((field) => field.key === input.originalKey);

  if (fieldIndex === -1) {
    throw new Error("Field not found");
  }

  const [nextField] = listSchemaDefinitionSchema.parse([JSON.parse(input.field)]);
  const currentField = fields[fieldIndex];
  const sanitizedField = {
    ...nextField,
    // Preserve the stored data key for existing fields so renaming stays cosmetic.
    key: currentField.key,
  };
  const nextFields = [...fields];
  nextFields[fieldIndex] = sanitizedField;
  const normalizedFields = normalizeListFields(nextFields);

  await db
    .update(lists)
    .set({
      schema: normalizedFields,
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, input.listId), eq(lists.workspaceId, input.workspaceId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listSettings(input.workspaceSlug, input.listId));
};

const deleteFieldSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  originalKey: z.string().min(1),
});

const moveFieldSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  originalKey: z.string().min(1),
  direction: z.enum(["left", "right"]),
});

export const deleteFieldAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = deleteFieldSchema.parse(Object.fromEntries(formData));

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

  const fields = parseStoredListFields(access.list.schema);

  if (input.originalKey === coreListFields.title.key || input.originalKey === coreListFields.description.key) {
    throw new Error("Title and description cannot be removed");
  }

  if (fields.length <= 2) {
    throw new Error("Lists need title and description");
  }

  const nextFields = normalizeListFields(fields.filter((field) => field.key !== input.originalKey));

  await db
    .update(lists)
    .set({
      schema: nextFields,
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, input.listId), eq(lists.workspaceId, input.workspaceId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listSettings(input.workspaceSlug, input.listId));
};

export const moveFieldAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = moveFieldSchema.parse(Object.fromEntries(formData));

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

  const fields = parseStoredListFields(access.list.schema);
  const fieldIndex = fields.findIndex((field) => field.key === input.originalKey);

  if (fieldIndex === -1) {
    throw new Error("Field not found");
  }

  const nextIndex = input.direction === "left" ? fieldIndex - 1 : fieldIndex + 1;

  if (nextIndex < 0 || nextIndex >= fields.length) {
    return;
  }

  const nextFields = [...fields];
  const [field] = nextFields.splice(fieldIndex, 1);
  nextFields.splice(nextIndex, 0, field);

  await db
    .update(lists)
    .set({
      schema: normalizeListFields(nextFields),
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, input.listId), eq(lists.workspaceId, input.workspaceId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listSettings(input.workspaceSlug, input.listId));
};

const itemInputSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  payload: z.string(),
  insertAt: z.coerce.number().int().min(0).optional(),
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
  const fields = parseStoredListFields(access.list.schema);
  const itemSchema = buildItemSchema(fields);
  const data = itemSchema.parse(payload);
  const [{ value: itemCount }] = await db
    .select({ value: count() })
    .from(listItems)
    .where(eq(listItems.listId, input.listId));
  const insertAt = input.insertAt ?? itemCount;

  await db
    .update(listItems)
    .set({
      sortOrder: sql`${listItems.sortOrder} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(listItems.listId, input.listId), gte(listItems.sortOrder, insertAt)));

  await db.insert(listItems).values({
    id: createId(),
    listId: input.listId,
    createdBy: session.user.id,
    updatedBy: session.user.id,
    sortOrder: insertAt,
    data,
  });

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};

const updateItemInputSchema = itemInputSchema.extend({
  itemId: z.string().uuid(),
});

export const updateItemAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = updateItemInputSchema.parse(Object.fromEntries(formData));

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
  const fields = parseStoredListFields(access.list.schema);
  const itemSchema = buildItemSchema(fields);
  const data = itemSchema.parse(payload);

  await db
    .update(listItems)
    .set({
      data,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    })
    .where(and(eq(listItems.id, input.itemId), eq(listItems.listId, input.listId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
  revalidatePath(routes.listItem(input.workspaceSlug, input.listId, input.itemId));
};

const deleteItemInputSchema = z.object({
  itemId: z.string().uuid(),
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  returnToList: z.enum(["true", "false"]).optional(),
});

export const deleteItemAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = deleteItemInputSchema.parse(Object.fromEntries(formData));

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

  await db.delete(listItems).where(and(eq(listItems.id, input.itemId), eq(listItems.listId, input.listId)));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));

  if (input.returnToList === "true") {
    redirect(routes.list(input.workspaceSlug, input.listId));
  }
};

const reorderItemsInputSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  orderedItemIds: z.string(),
});

export const reorderItemsAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = reorderItemsInputSchema.parse(Object.fromEntries(formData));

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

  const orderedItemIds = z.array(z.string().uuid()).parse(JSON.parse(input.orderedItemIds));

  await Promise.all(
    orderedItemIds.map((itemId, index) =>
      db
        .update(listItems)
        .set({
          sortOrder: index,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        })
        .where(and(eq(listItems.id, itemId), eq(listItems.listId, input.listId))),
    ),
  );

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

const saveViewSchema = z.object({
  listId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  name: z.string().min(1),
  sortField: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  filters: z.string().optional(),
  itemView: z.enum(["side", "center", "full"]).optional(),
});

export const saveListViewAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = saveViewSchema.parse(Object.fromEntries(formData));

  const workspaceMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, input.workspaceId),
      eq(workspaceMembers.userId, session.user.id),
    ),
  });

  if (!workspaceMembership) {
    throw new Error("Workspace access denied");
  }

  await requireListAccess({
    listId: input.listId,
    userId: session.user.id,
    workspaceId: input.workspaceId,
    workspaceRole: workspaceMembership.role,
  });

  const queryState = parseListQueryState({
    sortField: input.sortField,
    sortDir: input.sortDir,
    filters: input.filters,
    itemView: input.itemView,
  });

  const existing = await db.query.listViews.findFirst({
    where: and(
      eq(listViews.listId, input.listId),
      eq(listViews.userId, session.user.id),
      eq(listViews.name, input.name),
    ),
  });

  if (existing) {
    await db
      .update(listViews)
      .set({ state: queryState, updatedAt: new Date() })
      .where(eq(listViews.id, existing.id));
  } else {
    await db.insert(listViews).values({
      id: createId(),
      listId: input.listId,
      userId: session.user.id,
      name: input.name,
      state: queryState,
    });
  }

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};

const manageViewSchema = z.object({
  viewId: z.string().uuid(),
  listId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
});

export const deleteListViewAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = manageViewSchema.parse(Object.fromEntries(formData));

  const view = await db.query.listViews.findFirst({
    where: and(eq(listViews.id, input.viewId), eq(listViews.userId, session.user.id)),
  });

  if (!view) {
    throw new Error("View not found");
  }

  await db.delete(listViews).where(eq(listViews.id, input.viewId));
  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};

export const favoriteListViewAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = manageViewSchema.parse(Object.fromEntries(formData));

  const view = await db.query.listViews.findFirst({
    where: and(eq(listViews.id, input.viewId), eq(listViews.userId, session.user.id)),
  });

  if (!view) {
    throw new Error("View not found");
  }

  await db
    .update(listViews)
    .set({ isFavorite: view.isFavorite === "true" ? "false" : "true", updatedAt: new Date() })
    .where(eq(listViews.id, input.viewId));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};

export const setDefaultListViewAction = async (formData: FormData) => {
  const session = await requireApprovedSession();
  const input = manageViewSchema.parse(Object.fromEntries(formData));

  const view = await db.query.listViews.findFirst({
    where: and(eq(listViews.id, input.viewId), eq(listViews.userId, session.user.id)),
  });

  if (!view) {
    throw new Error("View not found");
  }

  await db
    .update(listViews)
    .set({ isDefault: "false", updatedAt: new Date() })
    .where(and(eq(listViews.listId, view.listId), eq(listViews.userId, session.user.id)));

  await db
    .update(listViews)
    .set({ isDefault: "true", updatedAt: new Date() })
    .where(eq(listViews.id, input.viewId));

  revalidatePath(routes.list(input.workspaceSlug, input.listId));
};
