import Link from "next/link";

import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";

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
    <div className="flex flex-wrap gap-2">
      {views.map((view) => (
        <Link
          key={view.id}
          href={`${basePath}?${serializeListQueryState(view.state)}`}
          className="inline-flex rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {view.name}
        </Link>
      ))}
    </div>
  );
}
