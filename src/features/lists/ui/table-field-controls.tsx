"use client";

import { useMemo, useState } from "react";

import { ArrowLeft, ArrowRight, Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteFieldAction, moveFieldAction, quickAddFieldAction, saveFieldAction } from "@/features/lists/server/actions";
import { coreListFields, fieldTypeLabels, type FieldDefinition, type FieldType } from "@/shared/lib/list-schema";
import { FieldTypeIcon } from "@/shared/ui/field-type-icon";

export function FieldHeaderEditor({
  field,
  fieldsCount,
  fieldIndex,
  workspaceId,
  workspaceSlug,
  listId,
  availableLists,
}: {
  field: FieldDefinition;
  fieldsCount: number;
  fieldIndex: number;
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  availableLists: Array<{ id: string; name: string }>;
}) {
  const [label, setLabel] = useState(field.label);
  const [type, setType] = useState<FieldType>(field.type);
  const [required, setRequired] = useState(field.required);
  const [multiple, setMultiple] = useState(field.multiple ?? false);
  const [width, setWidth] = useState(field.width ?? "regular");
  const [targetListId, setTargetListId] = useState(field.targetListId ?? "");
  const isCoreField = field.key === coreListFields.title.key || field.key === coreListFields.description.key;

  const payload = useMemo(
    () =>
      JSON.stringify({
        ...field,
        label,
        type,
        required,
        width,
        multiple,
        ...(type === "relation"
          ? { targetListId: targetListId || undefined }
          : { targetListId: undefined }),
      }),
    [field, label, type, required, width, multiple, targetListId],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-full justify-start gap-2 rounded-xl px-3 font-medium text-foreground transition-all duration-200 hover:bg-primary/8 hover:text-primary hover:shadow-sm"
          />
        }
      >
        <span>{field.label}</span>
        <FieldTypeIcon type={field.type} className="size-3.5 text-muted-foreground" />
        <Settings2 className="size-3.5 text-muted-foreground" />
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
            <Input value={label} disabled={isCoreField} onChange={(event) => setLabel(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => !isCoreField && setType(value as FieldType)}>
              <SelectTrigger className="w-full">
                <span className="inline-flex items-center gap-2 text-sm">
                  <FieldTypeIcon type={type} className="size-4 text-muted-foreground" />
                  <span>{fieldTypeLabels[type]}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, itemLabel]) => (
                  <SelectItem key={value} value={value}>
                    <span className="inline-flex items-center gap-2">
                      <FieldTypeIcon type={value as FieldType} className="size-4 text-muted-foreground" />
                      {itemLabel}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Width</Label>
            <Select value={width} onValueChange={(value) => setWidth(value as "compact" | "regular" | "wide")}>
              <SelectTrigger className="w-full">
                <span className="text-sm">{width === "compact" ? "Compact" : width === "wide" ? "Wide" : "Regular"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
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
            <Button type="button" variant={required ? "default" : "outline"} className="rounded-full" disabled={isCoreField} onClick={() => setRequired((current) => !current)}>
              {required ? "Required" : "Optional"}
            </Button>
            <Button type="button" variant={multiple ? "default" : "outline"} className="rounded-full" disabled={isCoreField} onClick={() => setMultiple((current) => !current)}>
              {multiple ? "More than one" : "Single value"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" size="sm" className="rounded-full">Save</Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          <form action={moveFieldAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="originalKey" value={field.key} />
            <input type="hidden" name="direction" value="left" />
            <Button type="submit" size="icon-sm" variant="outline" className="rounded-full" disabled={fieldIndex === 0} aria-label={`Move ${field.label} left`}>
              <ArrowLeft className="size-4" />
            </Button>
          </form>
          <form action={moveFieldAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="originalKey" value={field.key} />
            <input type="hidden" name="direction" value="right" />
            <Button type="submit" size="icon-sm" variant="outline" className="rounded-full" disabled={fieldIndex === fieldsCount - 1} aria-label={`Move ${field.label} right`}>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        {fieldsCount > 1 && !isCoreField ? (
          <form action={deleteFieldAction} className="pt-2">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="originalKey" value={field.key} />
            <Button type="submit" size="icon-sm" variant="ghost" className="rounded-full text-muted-foreground" aria-label={`Remove ${field.label} field`}>
              <Trash2 className="size-4" />
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
      <PopoverTrigger
        render={
          <Button variant="outline" size="icon-sm" className="rounded-full" aria-label="Add field">
            <Plus className="size-4" />
          </Button>
        }
      />
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
                <span className="inline-flex items-center gap-2 text-sm">
                  <FieldTypeIcon type={type} className="size-4 text-muted-foreground" />
                  <span>{fieldTypeLabels[type]}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, itemLabel]) => (
                  <SelectItem key={value} value={value}>
                    <span className="inline-flex items-center gap-2">
                      <FieldTypeIcon type={value as FieldType} className="size-4 text-muted-foreground" />
                      {itemLabel}
                    </span>
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
