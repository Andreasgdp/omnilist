import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListDetail } from "@/features/lists/server/queries";
import { getListsForWorkspace } from "@/features/lists/server/queries";
import { ItemSheet } from "@/features/lists/ui/item-sheet";
import { ListBreadcrumbs } from "@/features/lists/ui/list-breadcrumbs";
import { ListFilters } from "@/features/lists/ui/list-filters";
import { ListTable } from "@/features/lists/ui/list-table";
import { ListPageActions } from "@/features/lists/ui/list-page-actions";
import { ItemViewModePicker } from "@/features/lists/ui/item-view-mode-picker";
import { ViewChipList } from "@/features/lists/ui/view-chip-list";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { NavLink } from "@/shared/ui/nav-link";

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

  const availableLists = await getListsForWorkspace({
    workspaceId: workspace.id,
    userId: session.user.id,
  });
  const canEdit = detail.role === "owner" || detail.role === "editor";
  const relationTargetLists = availableLists
    .filter((list) => list.id !== detail.list.id)
    .map((list) => ({ id: list.id, name: list.name }));
  const itemViewMode = detail.queryState.itemView;

  return (
    <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <ListBreadcrumbs
          workspaceSlug={workspace.slug}
          workspaceName={workspace.name}
          listName={detail.list.name}
        />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="min-w-0">
              <h1 className="truncate text-4xl font-semibold tracking-tight text-foreground">{detail.list.name}</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {detail.list.description || "Shape this list into a lightweight workspace for planning, notes, and linked work."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{detail.role}</Badge>
              <Badge>{detail.list.visibility}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NavLink
              className="inline-flex h-9 items-center justify-center rounded-full border border-border/70 px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              href={`/w/${workspace.slug}/lists/${detail.list.id}/share`}
            >
              Share
            </NavLink>
            {canEdit ? (
              <ItemSheet
                trigger={
                  <Button className="rounded-full px-4">
                    <Plus className="size-4" />
                    New
                  </Button>
                }
                mode="create"
                workspaceId={workspace.id}
                workspaceSlug={workspace.slug}
                listId={detail.list.id}
                insertAt={detail.items.length}
                fields={detail.fields}
                relationOptions={detail.relationOptions}
              />
            ) : null}
            <ListPageActions
              listId={detail.list.id}
              workspaceId={workspace.id}
              workspaceSlug={workspace.slug}
              queryState={detail.queryState}
              fields={detail.fields}
              relationOptions={detail.relationOptions}
              itemViewMode={itemViewMode}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[2rem] border border-border/60 bg-card/70 px-3 py-3 shadow-sm shadow-primary/5 backdrop-blur-sm sm:px-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <ViewChipList
              views={detail.views.map((view) => ({
                id: view.id,
                name: view.name,
                state: view.state,
                isFavorite: view.isFavorite,
                isDefault: view.isDefault,
              }))}
              basePath={`/w/${workspace.slug}/lists/${detail.list.id}`}
              listId={detail.list.id}
              workspaceSlug={workspace.slug}
              fields={detail.fields}
              relationOptions={detail.relationOptions}
              itemViewMode={itemViewMode}
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ItemViewModePicker itemViewMode={itemViewMode} queryState={detail.queryState} />
              <ListFilters
                fields={detail.fields}
                queryState={detail.queryState}
                relationOptions={detail.relationOptions}
              />
            </div>
          </div>

          <p className="px-1 text-sm text-muted-foreground">
            {canEdit
              ? "Open any row to edit it in a side peek. Add items from the top-right New button or directly between rows."
              : `This list is read only for your current role: ${detail.role}.`}
          </p>
        </div>

        <ListTable
          fields={detail.fields}
          items={detail.items}
          relatedById={detail.relatedById}
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          listId={detail.list.id}
          relationOptions={detail.relationOptions}
          availableLists={relationTargetLists}
          canEditSchema={canEdit}
          itemViewMode={itemViewMode}
        />
      </div>
    </div>
  );
}
