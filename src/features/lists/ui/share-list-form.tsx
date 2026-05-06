import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shareListAction } from "@/features/lists/server/actions";
import { PendingButton } from "@/shared/ui/pending-button";

export function ShareListForm({
  listId,
  workspaceId,
  workspaceSlug,
  members,
}: {
  listId: string;
  workspaceId: string;
  workspaceSlug: string;
  members: Array<{ userId: string; userName: string; userEmail: string }>;
}) {
  return (
    <form action={shareListAction} className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />

      <div className="space-y-2">
        <Label>Workspace member</Label>
        <Select name="targetUserId">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.userName} ({member.userEmail})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select name="role" defaultValue="viewer">
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PendingButton type="submit" className="motion-press rounded-full px-5" pendingLabel="Sharing...">Share list</PendingButton>
    </form>
  );
}
