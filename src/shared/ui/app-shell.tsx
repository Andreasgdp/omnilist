import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/features/auth/server/auth";
import { routes } from "@/shared/lib/routes";
import { ThemeToggleShell } from "@/shared/ui/theme-toggle-shell";

export function AppShell({
  workspaceName,
  workspaceSlug,
  userName,
  children,
}: {
  workspaceName: string;
  workspaceSlug: string;
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href={routes.workspace(workspaceSlug)} className="space-y-1 rounded-2xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/60 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
                <Image src="/omnilist-logo.png" alt="Omnilist logo" width={36} height={36} className="size-9" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-primary/80">Omnilist</p>
                <h1 className="truncate text-lg font-semibold">{workspaceName}</h1>
              </div>
              <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground sm:inline-flex">
                {workspaceSlug}
              </span>
            </div>
          </Link>

          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">
            <ThemeToggleShell />

            <div className="min-w-0 text-right text-sm text-muted-foreground">
              <p className="truncate">{userName}</p>
              <p>Shared workspace</p>
            </div>

            <form
              action={async () => {
                "use server";
                await auth.api.signOut({
                  headers: await headers(),
                });
                redirect(routes.signIn);
              }}
            >
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 text-sm sm:px-6">
          <Link className="inline-flex rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground" href={routes.workspace(workspaceSlug)}>
            Overview
          </Link>
          <Link className="inline-flex rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground" href={routes.workspaceLists(workspaceSlug)}>
            Lists
          </Link>
          <Link className="inline-flex rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground" href={routes.newList(workspaceSlug)}>
            New list
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
