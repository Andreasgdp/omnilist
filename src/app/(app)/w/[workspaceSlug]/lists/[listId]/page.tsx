import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getListDetail } from "@/features/lists/server/queries";
import { ItemCreateForm } from "@/features/lists/ui/item-create-form";
import { ListFilters } from "@/features/lists/ui/list-filters";
import { ListTable } from "@/features/lists/ui/list-table";
import { SaveViewForm } from "@/features/lists/ui/save-view-form";
import { ViewChipList } from "@/features/lists/ui/view-chip-list";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { routes } from "@/shared/lib/routes";

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; listId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug, listId } = await params;
  const resolvedSearchParams = await searchParams;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);
  const detail = await getListDetail({
    listId,
    userId: session.user.id,
    workspaceId: workspace.id,
    searchParams: resolvedSearchParams,
  });

  if (!detail) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{detail.list.name}</CardTitle>
              <CardDescription>{detail.list.description || "No description yet."}</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">{detail.role}</Badge>
              <Badge>{detail.list.visibility}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link className="inline-flex h-10 items-center rounded-full border border-border/70 px-4 text-sm font-medium transition hover:bg-muted" href={routes.listSettings(workspace.slug, detail.list.id)}>
            Settings
          </Link>
          <Link className="inline-flex h-10 items-center rounded-full border border-border/70 px-4 text-sm font-medium transition hover:bg-muted" href={routes.listShare(workspace.slug, detail.list.id)}>
            Share
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <ViewChipList
          views={detail.views.map((view) => ({
            id: view.id,
            name: view.name,
            state: view.state,
          }))}
          basePath={routes.list(workspace.slug, detail.list.id)}
        />
        <ListFilters
          fields={detail.fields}
          currentSortField={detail.queryState.sortField}
          currentSortDir={detail.queryState.sortDir}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <ListTable fields={detail.fields} items={detail.items} />

        <div className="space-y-6">
          <SaveViewForm
            listId={detail.list.id}
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            queryState={detail.queryState}
          />

          {detail.role === "owner" || detail.role === "editor" ? (
            <ItemCreateForm
              workspaceId={workspace.id}
              workspaceSlug={workspace.slug}
              listId={detail.list.id}
              fields={detail.fields}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Read only</CardTitle>
                <CardDescription>
                  Your current role in this list is `{detail.role}`.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
