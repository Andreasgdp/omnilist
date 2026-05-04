import { redirect } from "next/navigation";

import { getSession } from "@/features/auth/server/session";
import { SignInCard } from "@/features/auth/ui/sign-in-card";
import { env } from "@/shared/lib/env";
import { routes } from "@/shared/lib/routes";

export default async function SignInPage() {
  const session = await getSession();
  const hasGoogleAuth = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  if (session) {
    redirect(routes.workspace(env.DEFAULT_SHARED_WORKSPACE_SLUG));
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignInCard hasGoogleAuth={hasGoogleAuth} />
    </div>
  );
}
