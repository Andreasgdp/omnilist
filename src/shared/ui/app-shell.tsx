import Image from "next/image";
import { Grid2x2, Home, Layers3, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/server/sign-out";
import { routes } from "@/shared/lib/routes";
import { AppShellClient } from "@/shared/ui/app-shell-client";
import { MobileNav } from "@/shared/ui/mobile-nav";
import { NavLink } from "@/shared/ui/nav-link";
import { PageTransition } from "@/shared/ui/page-transition";
import { ThemeToggleShell } from "@/shared/ui/theme-toggle-shell";

export function AppShell({
  workspaceName,
  workspaceSlug,
  userName,
  userImage,
  children,
}: {
  workspaceName: string;
  workspaceSlug: string;
  userName: string;
  userImage?: string | null;
  children: React.ReactNode;
}) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShellClient
      sidebar={
        <div className="flex h-full flex-col px-3 pb-3">
          <div className="rounded-2xl px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/60 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
                <Image src="/omnilist-logo.png" alt="Omnilist logo" width={30} height={30} className="size-7.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/80">Omnilist</p>
                <p className="truncate text-sm font-medium text-foreground">{workspaceName}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <NavLink
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              href={routes.workspace(workspaceSlug)}
            >
              <Home className="size-4 shrink-0" />
              <span>Home</span>
            </NavLink>
            <NavLink
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              activePrefixes={[routes.workspaceLists(workspaceSlug)]}
              href={routes.workspaceLists(workspaceSlug)}
            >
              <Layers3 className="size-4 shrink-0" />
              <span>Lists</span>
            </NavLink>
            <NavLink
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              href={routes.newList(workspaceSlug)}
            >
              <Plus className="size-4 shrink-0" />
              <span>New list</span>
            </NavLink>
          </div>

          <div className="mt-5 rounded-2xl border border-border/60 bg-background/55 p-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Grid2x2 className="size-4" />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{workspaceName}</p>
                <p className="truncate text-xs">{workspaceSlug}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 rounded-2xl border border-border/60 bg-background/55 p-3">
            <div className="flex items-center gap-3">
              {userImage ? (
                <Image src={userImage} alt={userName} width={36} height={36} className="size-9 rounded-full object-cover" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                  {initials}
                </div>
              )}
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium text-foreground">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">Shared workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggleShell />
              <form className="flex-1" action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full rounded-xl">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      }
      collapsedSidebar={
        <div className="flex h-full flex-col items-center px-2 pb-3">
          <NavLink href={routes.workspace(workspaceSlug)} className="flex justify-center rounded-xl p-2 transition hover:bg-muted hover:text-foreground">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/60 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
              <Image src="/omnilist-logo.png" alt="Omnilist logo" width={26} height={26} className="size-6.5" />
            </div>
          </NavLink>

          <div className="mt-3 space-y-1">
            <NavLink
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              href={routes.workspace(workspaceSlug)}
            >
              <Home className="size-4 shrink-0" />
            </NavLink>
            <NavLink
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              activePrefixes={[routes.workspaceLists(workspaceSlug)]}
              href={routes.workspaceLists(workspaceSlug)}
            >
              <Layers3 className="size-4 shrink-0" />
            </NavLink>
            <NavLink
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeClassName="bg-muted text-foreground shadow-sm"
              href={routes.newList(workspaceSlug)}
            >
              <Plus className="size-4 shrink-0" />
            </NavLink>
          </div>

          <div className="mt-auto w-full rounded-2xl border border-border/60 bg-background/55 p-2">
            <div className="flex justify-center">
              {userImage ? (
                <Image src={userImage} alt={userName} width={36} height={36} className="size-9 rounded-full object-cover" />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                  {initials}
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <ThemeToggleShell />
              <form className="w-full" action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full rounded-xl px-0">
                  Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen overflow-x-hidden lg:min-h-0">
        <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
        <MobileNav workspaceSlug={workspaceSlug} />
      </div>
    </AppShellClient>
  );
}
