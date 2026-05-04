import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { workspaceMembers, workspaces } from "@/db/schema";
import { env } from "@/shared/lib/env";

const createId = () => crypto.randomUUID();

export const ensureDefaultWorkspace = async (createdBy: string) => {
  const existing = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, env.DEFAULT_SHARED_WORKSPACE_SLUG),
  });

  if (existing) {
    return existing;
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      id: createId(),
      slug: env.DEFAULT_SHARED_WORKSPACE_SLUG,
      name: env.DEFAULT_SHARED_WORKSPACE_NAME,
      createdBy,
    })
    .returning();

  return workspace;
};

export const ensureUserWorkspaceMembership = async (userId: string) => {
  const workspace = await ensureDefaultWorkspace(userId);

  const existingMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, userId),
    ),
  });

  if (!existingMembership) {
    await db.insert(workspaceMembers).values({
      id: createId(),
      workspaceId: workspace.id,
      userId,
      role: "admin",
    });
  }

  return workspace;
};

export const getWorkspaceForUser = async (userId: string, slug: string) => {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
  });

  if (!workspace) {
    return null;
  }

  return db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.userId, userId),
      eq(workspaceMembers.workspaceId, workspace.id),
    ),
    with: {
      workspace: true,
      user: true,
    },
  });
};
