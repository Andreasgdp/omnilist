import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { listMembers, lists } from "@/db/schema";
import { resolveEffectiveListRole } from "@/shared/lib/permissions";

export const requireListAccess = async ({
  listId,
  userId,
  workspaceId,
  workspaceRole,
}: {
  listId: string;
  userId: string;
  workspaceId: string;
  workspaceRole: "admin" | "member";
}) => {
  const list = await db.query.lists.findFirst({
    where: and(eq(lists.id, listId), eq(lists.workspaceId, workspaceId)),
  });

  if (!list) {
    notFound();
  }

  const membership = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, listId), eq(listMembers.userId, userId)),
  });

  const role = resolveEffectiveListRole({
    workspaceRole,
    listRole: membership?.role ?? null,
    ownerId: list.ownerId,
    currentUserId: userId,
    visibility: list.visibility,
  });

  if (!role) {
    notFound();
  }

  return {
    list,
    membership,
    role,
  };
};
