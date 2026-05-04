import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";
import { NavLink } from "@/shared/ui/nav-link";

export function ViewChipList({
  views,
  basePath,
}: {
  views: Array<{ id: string; name: string; state: ListQueryState }>;
  basePath: string;
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
        <NavLink
          key={view.id}
          href={`${basePath}?${serializeListQueryState(view.state)}`}
          className="inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {view.name}
        </NavLink>
      ))}
      </div>
    </div>
  );
}
