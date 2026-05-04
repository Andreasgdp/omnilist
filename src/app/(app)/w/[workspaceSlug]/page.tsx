import Link from "next/link";

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
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{workspace.name}</CardTitle>
          <CardDescription>
            Shared workspace with private and workspace-visible lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You currently have access to {lists.length} list{lists.length === 1 ? "" : "s"}.
          </p>
          <Link className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" href={routes.newList(workspace.slug)}>
            Create a new list
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link className="inline-flex h-8 w-full items-center rounded-lg border px-4 text-sm font-medium" href={routes.workspaceLists(workspace.slug)}>
            All lists
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
