import { notFound } from "next/navigation";

import { requireApprovedSession } from "@/features/auth/server/guard";
import { getWorkspaceForUser } from "@/features/workspaces/server/service";

export const requireWorkspaceAccess = async (workspaceSlug: string) => {
  const session = await requireApprovedSession();
  const membership = await getWorkspaceForUser(session.user.id, workspaceSlug);

  if (!membership) {
    notFound();
  }

  return {
    session,
    membership,
    workspace: membership.workspace,
  };
};
