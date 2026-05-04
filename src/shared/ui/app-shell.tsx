import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "@/features/auth/server/auth";
import { routes } from "@/shared/lib/routes";

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
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Omnilist</p>
            <h1 className="text-lg font-semibold">{workspaceName}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-muted-foreground">
              <p>{userName}</p>
              <p>{workspaceSlug}</p>
            </div>

            <form
              action={async () => {
                "use server";
                await auth.api.signOut();
              }}
            >
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm">
          <Link className="inline-flex rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" href={routes.workspace(workspaceSlug)}>
            Overview
          </Link>
          <Link className="inline-flex rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" href={routes.workspaceLists(workspaceSlug)}>
            Lists
          </Link>
          <Link className="inline-flex rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" href={routes.newList(workspaceSlug)}>
            New list
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
