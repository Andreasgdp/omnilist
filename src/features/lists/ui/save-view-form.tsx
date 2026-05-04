import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveListViewAction } from "@/features/lists/server/actions";
import type { ListQueryState } from "@/features/lists/lib/query-state";

export function SaveViewForm({
  listId,
  workspaceId,
  workspaceSlug,
  queryState,
}: {
  listId: string;
  workspaceId: string;
  workspaceSlug: string;
  queryState: ListQueryState;
}) {
  return (
    <form action={saveListViewAction} className="rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="sortField" value={queryState.sortField ?? ""} />
      <input type="hidden" name="sortDir" value={queryState.sortDir ?? ""} />
      <input type="hidden" name="filters" value={JSON.stringify(queryState.filters)} />

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Save current view</h3>
          <p className="text-sm text-muted-foreground">Store this sort and filter setup for quick reuse.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="view-name">View name</Label>
          <Input id="view-name" name="name" placeholder="Planning only" required />
        </div>

        <Button type="submit" className="rounded-full px-5">
          Save view
        </Button>
      </div>
    </form>
  );
}
