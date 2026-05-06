import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { describeQueryState } from "@/features/lists/lib/query-state-display";
import { saveListViewAction } from "@/features/lists/server/actions";
import type { ListQueryState } from "@/features/lists/lib/query-state";
import type { FieldDefinition } from "@/shared/lib/list-schema";
import { PendingButton } from "@/shared/ui/pending-button";

export function SaveViewForm({
  listId,
  workspaceId,
  workspaceSlug,
  queryState,
  fields,
  relationOptions,
  compact = false,
}: {
  listId: string;
  workspaceId: string;
  workspaceSlug: string;
  queryState: ListQueryState;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  compact?: boolean;
}) {
  const summary = describeQueryState({
    state: queryState,
    fields,
    relationOptions,
  });

  return (
    <form action={saveListViewAction} className={compact ? "space-y-3" : "rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm"}>
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="sortField" value={queryState.sortField ?? ""} />
      <input type="hidden" name="sortDir" value={queryState.sortDir ?? ""} />
      <input type="hidden" name="filters" value={JSON.stringify(queryState.filters)} />
      <input type="hidden" name="itemView" value={queryState.itemView} />

      <div className="space-y-3">
        {!compact ? (
          <div>
            <h3 className="text-base font-semibold">Save current view</h3>
            <p className="text-sm text-muted-foreground">Store this sort and filter setup for quick reuse.</p>
          </div>
        ) : null}

        {summary.length > 0 ? (
          <div className="rounded-xl border border-border/50 bg-muted/25 px-3 py-2 text-sm text-muted-foreground">
            {summary.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="view-name">View name</Label>
          <Input id="view-name" name="name" placeholder="Planning only" required />
        </div>

        <PendingButton type="submit" className="motion-press rounded-full px-5" pendingLabel="Saving view...">
          Save view
        </PendingButton>
      </div>
    </form>
  );
}
