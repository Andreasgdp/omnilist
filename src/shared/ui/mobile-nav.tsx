"use client";

import { Home, Layers3, LogOut, PanelLeftOpen, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/features/auth/server/sign-out";
import { NavLink } from "@/shared/ui/nav-link";
import { routes } from "@/shared/lib/routes";

export function MobileNav({ workspaceSlug }: { workspaceSlug: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-border/60 bg-card/90 p-2 shadow-lg">
        <NavLink href={routes.workspace(workspaceSlug)} activeClassName="bg-muted text-foreground shadow-sm" className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <Home className="size-4" />
          <span>Home</span>
        </NavLink>
        <NavLink href={routes.workspaceLists(workspaceSlug)} activePrefixes={[routes.workspaceLists(workspaceSlug)]} activeClassName="bg-muted text-foreground shadow-sm" className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <Layers3 className="size-4" />
          <span>Lists</span>
        </NavLink>
        <NavLink href={routes.newList(workspaceSlug)} activeClassName="ring-2 ring-primary/30" className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
          <Plus className="size-4" />
          <span>New</span>
        </NavLink>
        <Sheet>
          <SheetTrigger className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <Sparkles className="size-4" />
            <span>More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[2rem]">
            <SheetHeader>
              <SheetTitle>Workspace</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-3">
              <NavLink href={routes.workspace(workspaceSlug)} className="rounded-2xl border border-border/60 px-4 py-4 text-sm font-medium transition hover:bg-muted">
                Go to overview
              </NavLink>
              <NavLink href={routes.workspaceLists(workspaceSlug)} className="rounded-2xl border border-border/60 px-4 py-4 text-sm font-medium transition hover:bg-muted">
                Browse all lists
              </NavLink>
              <NavLink href={routes.newList(workspaceSlug)} className="rounded-2xl border border-border/60 px-4 py-4 text-sm font-medium transition hover:bg-muted">
                Create a new list
              </NavLink>
              <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
                <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <PanelLeftOpen className="size-4" />
                  <span>Desktop sidebar</span>
                </div>
                <p className="text-sm text-muted-foreground">On larger screens, navigation, workspace info, and account controls now live in the left sidebar.</p>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="h-12 w-full rounded-2xl justify-start px-4 text-sm font-medium">
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
