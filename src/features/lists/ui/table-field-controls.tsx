"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteFieldAction, quickAddFieldAction, saveFieldAction } from "@/features/lists/server/actions";
import { fieldTypeLabels, type FieldDefinition, type FieldType } from "@/shared/lib/list-schema";

const createFieldKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";

export function FieldHeaderEditor({
  field,
  fieldsCount,
  workspaceId,
  workspaceSlug,
  listId,
  availableLists,
}: {
  field: FieldDefinition;
  fieldsCount: number;
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  availableLists: Array<{ id: string; name: string }>;
}) {
  const [label, setLabel] = useState(field.label);
  const [type, setType] = useState<FieldType>(field.type);
  const [required, setRequired] = useState(field.required);
  const [multiple, setMultiple] = useState(field.multiple ?? false);
  const [targetListId, setTargetListId] = useState(field.targetListId ?? "");

  const payload = useMemo(
    () =>
      JSON.stringify({
        ...field,
        key: createFieldKey(label),
        label,
        type,
        required,
        multiple,
        ...(type === "relation"
          ? { targetListId: targetListId || undefined }
          : { targetListId: undefined }),
      }),
    [field, label, type, required, multiple, targetListId],
  );

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="sm" className="h-auto justify-start px-0 font-medium text-foreground hover:bg-transparent" />}>
        {field.label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Edit field</PopoverTitle>
          <PopoverDescription>Change the field name or type right from the table header.</PopoverDescription>
        </PopoverHeader>

        <form action={saveFieldAction} className="space-y-3">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
          <input type="hidden" name="listId" value={listId} />
          <input type="hidden" name="originalKey" value={field.key} />
          <input type="hidden" name="field" value={payload} readOnly />

          <div className="space-y-2">
            <Label>Field name</Label>
            <Input value={label} onChange={(event) => setLabel(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as FieldType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, itemLabel]) => (
                  <SelectItem key={value} value={value}>
                    {itemLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "relation" ? (
            <div className="space-y-2">
              <Label>Link to list</Label>
              <Select value={targetListId || undefined} onValueChange={(value) => setTargetListId(value ?? "") }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a list" />
                </SelectTrigger>
                <SelectContent>
                  {availableLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={required ? "default" : "outline"} className="rounded-full" onClick={() => setRequired((current) => !current)}>
              {required ? "Required" : "Optional"}
            </Button>
            <Button type="button" variant={multiple ? "default" : "outline"} className="rounded-full" onClick={() => setMultiple((current) => !current)}>
              {multiple ? "More than one" : "Single value"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" size="sm" className="rounded-full">Save</Button>
          </div>
        </form>

        {fieldsCount > 1 ? (
          <form action={deleteFieldAction} className="pt-2">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="originalKey" value={field.key} />
            <Button type="submit" size="sm" variant="ghost" className="rounded-full text-muted-foreground">
              Remove
            </Button>
          </form>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function AddFieldButton({
  workspaceId,
  workspaceSlug,
  listId,
  availableLists,
}: {
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  availableLists: Array<{ id: string; name: string }>;
}) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [targetListId, setTargetListId] = useState(availableLists[0]?.id ?? "");

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="icon-sm" className="rounded-full">+</Button>} />
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Add field</PopoverTitle>
          <PopoverDescription>Add a new column directly from the table header.</PopoverDescription>
        </PopoverHeader>

        <form action={quickAddFieldAction} className="space-y-3">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
          <input type="hidden" name="listId" value={listId} />

          <div className="space-y-2">
            <Label>Field name</Label>
            <Input name="label" value={label} placeholder="Budget, booked, notes..." onChange={(event) => setLabel(event.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select name="type" value={type} onValueChange={(value) => setType(value as FieldType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, itemLabel]) => (
                  <SelectItem key={value} value={value}>
                    {itemLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "relation" ? (
            <div className="space-y-2">
              <Label>Link to list</Label>
              <Select name="targetListId" value={targetListId || undefined} onValueChange={(value) => setTargetListId(value ?? "") }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a list" />
                </SelectTrigger>
                <SelectContent>
                  {availableLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <Button type="submit" size="sm" className="rounded-full">Add field</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
