import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shareListAction } from "@/features/lists/server/actions";

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
    <form action={shareListAction} className="space-y-4 rounded-lg border bg-card p-4">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />

      <div className="space-y-2">
        <Label>Workspace member</Label>
        <Select name="targetUserId">
          <SelectTrigger>
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
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Share list</Button>
    </form>
  );
}
