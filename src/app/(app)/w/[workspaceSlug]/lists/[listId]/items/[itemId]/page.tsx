import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { deleteItemAction } from "@/features/lists/server/actions";
import { getListItemDetail } from "@/features/lists/server/queries";
import { ItemForm } from "@/features/lists/ui/item-form";
import { requireWorkspaceAccess } from "@/features/workspaces/server/access";
import { routes } from "@/shared/lib/routes";
import { NavLink } from "@/shared/ui/nav-link";

export default async function ListItemPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; listId: string; itemId: string }>;
}) {
  const { workspaceSlug, listId, itemId } = await params;
  const { session, workspace } = await requireWorkspaceAccess(workspaceSlug);
  const detail = await getListItemDetail({
    listId,
    itemId,
    userId: session.user.id,
    workspaceId: workspace.id,
  });

  if (!detail) {
    notFound();
  }

  const title = typeof detail.item.data.title === "string" ? detail.item.data.title : "Untitled item";

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-2 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <NavLink href={routes.list(workspace.slug, listId)} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-muted hover:text-foreground">
              <ArrowLeft className="size-4" />
              Back to list
            </NavLink>
            <span>/</span>
            <span className="truncate">{detail.list.name}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="text-sm text-muted-foreground">A roomier page for structured properties and longer notes.</p>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card/60 p-5 shadow-sm shadow-primary/5 backdrop-blur-sm sm:p-6">
          <ItemForm
            mode="edit"
            workspaceId={workspace.id}
            workspaceSlug={workspace.slug}
            listId={listId}
            itemId={itemId}
            fields={detail.fields}
            relationOptions={detail.relationOptions}
            initialValues={detail.item.data}
            showHeader={false}
          />

          <form action={deleteItemAction} className="mt-6 border-t border-border/60 pt-6">
            <input type="hidden" name="workspaceId" value={workspace.id} />
            <input type="hidden" name="workspaceSlug" value={workspace.slug} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="returnToList" value="true" />
            <Button type="submit" variant="ghost" className="rounded-full text-destructive">
              Delete item
            </Button>
          </form>
        </div>
    </div>
  );
}
