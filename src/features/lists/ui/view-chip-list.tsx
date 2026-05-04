import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";
import { deleteListViewAction, favoriteListViewAction, setDefaultListViewAction } from "@/features/lists/server/actions";
import { NavLink } from "@/shared/ui/nav-link";

export function ViewChipList({
  views,
  basePath,
  listId,
  workspaceSlug,
}: {
  views: Array<{ id: string; name: string; state: ListQueryState; isFavorite: string; isDefault: string }>;
  basePath: string;
  listId: string;
  workspaceSlug: string;
}) {
  if (views.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Saved views</h3>
          <p className="text-sm text-muted-foreground">Jump back into the filters that matter most.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
      {views.map((view) => (
        <div key={view.id} className="flex items-center gap-2 rounded-full border border-border/70 bg-card pr-2">
          <NavLink
            href={`${basePath}?${serializeListQueryState(view.state)}`}
            className="inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              {view.isFavorite === "true" ? <span aria-hidden="true">★</span> : null}
              {view.isDefault === "true" ? <span aria-hidden="true">●</span> : null}
              {view.name}
            </span>
          </NavLink>

          <form action={favoriteListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="text-xs text-muted-foreground transition hover:text-foreground">
              ☆
            </button>
          </form>

          <form action={setDefaultListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="text-xs text-muted-foreground transition hover:text-foreground">
              Set default
            </button>
          </form>

          <form action={deleteListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="text-xs text-muted-foreground transition hover:text-destructive">
              Delete
            </button>
          </form>
        </div>
      ))}
      </div>
    </div>
  );
}
