import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ListSchemaForm } from "@/features/lists/ui/list-schema-form";
import type { FieldDefinition } from "@/shared/lib/list-schema";

export function CreateListForm({
  action,
  workspaceId,
  workspaceSlug,
  listId,
  initialName,
  initialDescription,
  initialVisibility = "private",
  initialFields,
  availableLists = [],
  submitLabel = "Create list",
  allowReorder = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  workspaceId: string;
  workspaceSlug: string;
  listId?: string;
  initialName?: string;
  initialDescription?: string | null;
  initialVisibility?: "private" | "workspace";
  initialFields?: FieldDefinition[];
  availableLists?: Array<{ id: string; name: string }>;
  submitLabel?: string;
  allowReorder?: boolean;
}) {
  return (
    <form action={action} className="space-y-6 rounded-2xl">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      {listId ? <input type="hidden" name="listId" value={listId} /> : null}

      <div className="space-y-2">
        <Label htmlFor="name">List name</Label>
        <Input id="name" name="name" placeholder="Trip planner" defaultValue={initialName} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Shared planning board for an upcoming trip"
          defaultValue={initialDescription ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select name="visibility" defaultValue={initialVisibility}>
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
        <ListSchemaForm initialFields={initialFields} availableLists={availableLists} allowReorder={allowReorder} />
      </div>

      <Button type="submit" className="rounded-full px-5">{submitLabel}</Button>
    </form>
  );
}
