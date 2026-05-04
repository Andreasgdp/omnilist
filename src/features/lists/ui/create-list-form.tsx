import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createListAction } from "@/features/lists/server/actions";
import { ListSchemaForm } from "@/features/lists/ui/list-schema-form";

export function CreateListForm({ workspaceId, workspaceSlug }: { workspaceId: string; workspaceSlug: string }) {
  return (
    <form action={createListAction} className="space-y-6">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />

      <div className="space-y-2">
        <Label htmlFor="name">List name</Label>
        <Input id="name" name="name" placeholder="Trip planner" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Shared planning board for an upcoming trip" />
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select name="visibility" defaultValue="private">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="workspace">Workspace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fields</Label>
        <ListSchemaForm />
      </div>

      <Button type="submit">Create list</Button>
    </form>
  );
}
