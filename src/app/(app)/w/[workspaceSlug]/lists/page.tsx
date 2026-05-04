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

        <Link className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" href={routes.newList(workspace.slug)}>
          New list
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{list.name}</CardTitle>
                <Badge variant={list.visibility === "workspace" ? "default" : "outline"}>
                  {list.visibility}
                </Badge>
              </div>
              <CardDescription>{list.description || "No description yet."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="inline-flex h-8 items-center rounded-lg border px-4 text-sm font-medium" href={routes.list(workspace.slug, list.id)}>
                Open list
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
