import { redirect } from "next/navigation";

import { requireApprovedSession } from "@/features/auth/server/guard";
import { env } from "@/shared/lib/env";
import { routes } from "@/shared/lib/routes";

export default async function HomePage() {
  await requireApprovedSession();
  redirect(routes.workspace(env.DEFAULT_SHARED_WORKSPACE_SLUG));
}
