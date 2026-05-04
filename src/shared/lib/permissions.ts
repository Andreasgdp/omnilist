export type WorkspaceRole = "admin" | "member";
export type ListVisibility = "private" | "workspace";
export type ListRole = "owner" | "editor" | "viewer";

const listRoleWeight: Record<ListRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export const canManageWorkspace = (role: WorkspaceRole) => role === "admin";

export const canEditList = (role: ListRole | null) =>
  role === "owner" || role === "editor";

export const canShareRole = (actorRole: ListRole | null, targetRole: ListRole) => {
  if (!actorRole) return false;
  if (actorRole === "owner") return targetRole !== "owner";
  if (actorRole === "editor") return targetRole === "viewer";
  return false;
};

export const resolveEffectiveListRole = ({
  workspaceRole,
  listRole,
  ownerId,
  currentUserId,
  visibility,
}: {
  workspaceRole: WorkspaceRole;
  listRole: ListRole | null;
  ownerId: string;
  currentUserId: string;
  visibility: ListVisibility;
}) => {
  if (ownerId === currentUserId) {
    return "owner" as const;
  }

  if (listRole) {
    return listRole;
  }

  if (visibility === "workspace" && workspaceRole) {
    return "viewer" as const;
  }

  return null;
};

export const compareListRoles = (left: ListRole, right: ListRole) =>
  listRoleWeight[left] - listRoleWeight[right];
