import { Circle, Star, Trash2 } from "lucide-react";

import { describeQueryState } from "@/features/lists/lib/query-state-display";
import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";
import { deleteListViewAction, favoriteListViewAction, setDefaultListViewAction } from "@/features/lists/server/actions";
import type { FieldDefinition } from "@/shared/lib/list-schema";
import { NavLink } from "@/shared/ui/nav-link";

export function ViewChipList({
  views,
  basePath,
  listId,
  workspaceSlug,
  fields,
  relationOptions,
}: {
  views: Array<{ id: string; name: string; state: ListQueryState; isFavorite: string; isDefault: string }>;
  basePath: string;
  listId: string;
  workspaceSlug: string;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
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
        <div key={view.id} className="motion-pill flex items-center gap-2 rounded-2xl border border-border/70 bg-card pr-2 shadow-sm shadow-primary/5">
          <NavLink
            href={`${basePath}?${serializeListQueryState(view.state)}`}
            className="inline-flex min-w-0 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <span className="flex min-w-0 flex-col items-start gap-1">
              <span className="flex items-center gap-2">
              {view.isFavorite === "true" ? <Star className="size-3.5 fill-current text-amber-500" aria-hidden="true" /> : null}
              {view.isDefault === "true" ? <Circle className="size-2.5 fill-current text-primary" aria-hidden="true" /> : null}
              {view.name}
              </span>
              <span className="max-w-72 truncate text-xs text-muted-foreground/80">
                {describeQueryState({
                  state: view.state,
                  fields,
                  relationOptions,
                }).join(" • ") || "Saved view"}
              </span>
            </span>
          </NavLink>

          <form action={favoriteListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="rounded-full p-1 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground" aria-label={`Favorite ${view.name}`}>
              <Star className="size-3.5" />
            </button>
          </form>

          <form action={setDefaultListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="rounded-full p-1 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground" aria-label={`Set ${view.name} as default`}>
              <Circle className="size-3.5" />
            </button>
          </form>

          <form action={deleteListViewAction}>
            <input type="hidden" name="viewId" value={view.id} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <button type="submit" className="rounded-full p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${view.name}`}>
              <Trash2 className="size-3.5" />
            </button>
          </form>
        </div>
      ))}
      </div>
    </div>
  );
}
