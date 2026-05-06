import { redirect } from "next/navigation";

import { getSession } from "@/features/auth/server/session";
import { SignInCard } from "@/features/auth/ui/sign-in-card";
import { env } from "@/shared/lib/env";
import { routes } from "@/shared/lib/routes";

export default async function SignInPage() {
  const session = await getSession();
  const hasGoogleAuth = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const hasMagicLinkEmail = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);

  if (session) {
    redirect(routes.workspace(env.DEFAULT_SHARED_WORKSPACE_SLUG));
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="motion-fade-up space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Omnilist</p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Shared lists that feel fast, calm, and personal.
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">
            Capture ideas quickly, shape each list around your workflow, and keep collaboration lightweight instead of overwhelming.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="motion-fade-up motion-stagger-1 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-medium">Flexible fields</p>
              <p className="mt-1 text-sm text-muted-foreground">Build lists around real workflows, not fixed templates.</p>
            </div>
            <div className="motion-fade-up motion-stagger-2 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-medium">Shared planning</p>
              <p className="mt-1 text-sm text-muted-foreground">Keep workspaces collaborative while lists stay intentional.</p>
            </div>
            <div className="motion-fade-up motion-stagger-3 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-medium">Notion-like items</p>
              <p className="mt-1 text-sm text-muted-foreground">Let rows grow into richer records when needed.</p>
            </div>
          </div>
        </div>

        <div className="motion-fade-up motion-stagger-2">
          <SignInCard hasGoogleAuth={hasGoogleAuth} hasMagicLinkEmail={hasMagicLinkEmail} />
        </div>
      </div>
    </div>
  );
}
