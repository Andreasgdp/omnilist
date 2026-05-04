import { redirect } from "next/navigation";

import { requireSession } from "@/features/auth/server/session";
import { ensureUserWorkspaceMembership } from "@/features/workspaces/server/service";
import { allowedUserEmails } from "@/shared/lib/env";
import { routes } from "@/shared/lib/routes";

export const requireApprovedSession = async () => {
  const session = await requireSession();
  const email = session.user.email.toLowerCase();

  if (!allowedUserEmails.includes(email)) {
    redirect(routes.unauthorized);
  }

  await ensureUserWorkspaceMembership(session.user.id);

  return session;
};
