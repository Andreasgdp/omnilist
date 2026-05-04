import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getListsForWorkspace } from "@/features/lists/server/queries";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { routes } from "@/shared/lib/routes";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);
  const lists = await getListsForWorkspace({
    workspaceId: workspace.id,
    userId: session.user.id,
  });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_16%,white),color-mix(in_oklab,var(--accent)_18%,white)_45%,color-mix(in_oklab,var(--secondary)_40%,white))] p-5 shadow-sm sm:p-8 dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_20%,transparent),color-mix(in_oklab,var(--accent)_20%,transparent)_45%,color-mix(in_oklab,var(--secondary)_28%,transparent))]">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.2fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-18 items-center justify-center rounded-[1.5rem] bg-white/65 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:ring-white/10">
                <Image src="/omnilist-logo.png" alt="Omnilist logo" width={54} height={54} className="size-13" priority />
              </div>
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.35em] text-primary/75">Omnilist</p>
                <p className="text-sm text-foreground/65">Shared lists that stay personal when they need to.</p>
              </div>
            </div>

            <Badge variant="outline" className="rounded-full border-white/50 bg-white/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-foreground/70 dark:border-white/10 dark:bg-black/10 dark:text-foreground/80">
              Shared Lists, Simplified
            </Badge>

            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                A calmer dashboard for everything you plan, track, and share.
              </h2>
              <p className="max-w-lg text-base leading-7 text-foreground/75">
                Omnilist keeps private ownership, shared collaboration, and dynamic schemas in one place without forcing every list into the same shape.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 dark:bg-primary dark:text-primary-foreground" href={routes.newList(workspace.slug)}>
                Create custom list
              </Link>
              <Link className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:bg-background dark:bg-card/70" href={routes.workspaceLists(workspace.slug)}>
                Browse lists
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/40 bg-white/60 p-4 shadow-xl shadow-primary/10 backdrop-blur sm:p-5 dark:border-white/10 dark:bg-card/80">
            <div className="grid gap-4 md:grid-cols-2">
              {lists.slice(0, 4).map((list, index) => {
                const palette = [
                  "bg-sky-100/90 text-sky-900 dark:bg-sky-950/60 dark:text-sky-100",
                  "bg-violet-100/90 text-violet-900 dark:bg-violet-950/60 dark:text-violet-100",
                  "bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100",
                  "bg-amber-100/90 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100",
                ][index % 4];

                return (
                  <Link
                    key={list.id}
                    href={routes.list(workspace.slug, list.id)}
                    className={`block rounded-3xl border border-white/40 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md ${palette}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{list.name}</h3>
                      <Badge variant="outline" className="rounded-full border-current/20 bg-white/50 text-current dark:bg-black/10">
                        {list.visibility}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-current/75">
                      {list.description || "Dynamic shared board ready for custom fields."}
                    </p>
                  </Link>
                );
              })}

              {lists.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground dark:bg-background/20">
                  Your workspace is ready. Create the first list to make this space yours.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>{workspace.name}</CardTitle>
                <CardDescription>
                  Shared workspace with private and workspace-visible lists.
                </CardDescription>
              </div>

              <Badge variant="outline">{lists.length} active lists</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accessible</p>
                <p className="mt-2 text-3xl font-semibold">{lists.length}</p>
              </div>
              <div className="rounded-2xl bg-accent/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Private-first</p>
                <p className="mt-2 text-sm font-medium">Own lists, then share intentionally</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dynamic schema</p>
                <p className="mt-2 text-sm font-medium">Fields defined per list</p>
              </div>
            </div>

            <Link className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm" href={routes.newList(workspace.slug)}>
              Create a new list
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link className="inline-flex h-10 w-full items-center rounded-full border border-border/70 px-4 text-sm font-medium transition hover:bg-muted" href={routes.workspaceLists(workspace.slug)}>
              All lists
            </Link>
            <div className="rounded-3xl bg-secondary/60 p-4 text-sm text-secondary-foreground dark:bg-secondary/40">
              Seed data creates a demo workspace list so the local app is useful on first boot.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
