import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getListsForWorkspace } from "@/features/lists/server/queries";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { routes } from "@/shared/lib/routes";

export default async function ListsPage({
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Lists</h2>
          <p className="text-sm text-muted-foreground">Private and shared lists inside this workspace.</p>
        </div>

        <Link className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm" href={routes.newList(workspace.slug)}>
          New list
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lists.map((list, index) => {
          const palette = [
            "from-sky-100/90 to-sky-50/70 dark:from-sky-950/60 dark:to-sky-900/30",
            "from-violet-100/90 to-fuchsia-50/70 dark:from-violet-950/60 dark:to-fuchsia-950/30",
            "from-emerald-100/90 to-green-50/70 dark:from-emerald-950/60 dark:to-green-950/30",
            "from-amber-100/90 to-orange-50/70 dark:from-amber-950/60 dark:to-orange-950/30",
          ][index % 4];

          return (
            <Link key={list.id} href={routes.list(workspace.slug, list.id)} className="block">
              <Card className={`border-border/60 bg-gradient-to-br ${palette} shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <Badge variant={list.visibility === "workspace" ? "default" : "outline"}>
                      {list.visibility}
                    </Badge>
                  </div>
                  <CardDescription className="text-foreground/70 dark:text-foreground/75">
                    {list.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex h-10 items-center rounded-full border border-border/70 bg-background/70 px-4 text-sm font-medium transition hover:bg-background dark:bg-card/60">
                    Open list
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
