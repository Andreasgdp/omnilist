import Link from "next/link";
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
  itemViewMode = "side",
}: {
  views: Array<{ id: string; name: string; state: ListQueryState; isFavorite: string; isDefault: string }>;
  basePath: string;
  listId: string;
  workspaceSlug: string;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  itemViewMode?: "side" | "center" | "full";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
      <Link
        href={basePath}
        className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm"
      >
        Table
      </Link>

      {views.map((view) => (
        (() => {
          const params = new URLSearchParams(serializeListQueryState(view.state));
          if (itemViewMode !== "side") {
            params.set("itemView", itemViewMode);
          }
          const href = `${basePath}${params.toString() ? `?${params.toString()}` : ""}`;

          return (
        <div key={view.id} className="motion-pill flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/70 pr-2 shadow-sm shadow-primary/5">
          <NavLink
            href={href}
            className="inline-flex min-w-0 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <span className="flex min-w-0 flex-col items-start gap-1">
              <span className="flex items-center gap-2">
                {view.isFavorite === "true" ? <Star className="size-3.5 fill-current text-amber-500" aria-hidden="true" /> : null}
                {view.isDefault === "true" ? <Circle className="size-2.5 fill-current text-primary" aria-hidden="true" /> : null}
                {view.name}
              </span>
              <span className="max-w-72 truncate text-[11px] text-muted-foreground/80">
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
          );
        })()
      ))}
    </div>
  );
}
