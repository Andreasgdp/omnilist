"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DocumentEditor } from "@/features/lists/ui/document-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createItemAction, updateItemAction } from "@/features/lists/server/actions";
import type { FieldDefinition } from "@/shared/lib/list-schema";

const getFieldPlaceholder = (field: FieldDefinition) => {
  switch (field.type) {
    case "text":
      return `Add ${field.label.toLowerCase()}`;
    case "number":
      return `Enter ${field.label.toLowerCase()}`;
    case "date":
      return "Pick a date";
    case "url":
      return "Paste a link";
    default:
      return undefined;
  }
};

type Props = {
  mode: "create" | "edit";
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  itemId?: string;
  insertAt?: number;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  initialValues?: Record<string, unknown>;
};

export function ItemForm({
  mode,
  workspaceId,
  workspaceSlug,
  listId,
  itemId,
  insertAt,
  fields,
  relationOptions,
  initialValues,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});

  const payload = useMemo(() => JSON.stringify(values), [values]);
  const action = mode === "create" ? createItemAction : updateItemAction;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="listId" value={listId} />
      {itemId ? <input type="hidden" name="itemId" value={itemId} /> : null}
      {typeof insertAt === "number" ? <input type="hidden" name="insertAt" value={String(insertAt)} /> : null}
      <input type="hidden" name="payload" value={payload} readOnly />

      <div>
        <h3 className="text-lg font-semibold">{mode === "create" ? "Add item" : "Edit item"}</h3>
        <p className="text-sm text-muted-foreground">Fill in the details below. Keep it light now and add more later.</p>
      </div>

      {fields.map((field) => {
        if (field.type === "boolean") {
          return (
            <div key={field.key} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>{field.label}</Label>
                  <p className="text-xs text-muted-foreground">Turn this on if it applies.</p>
                </div>
                <Switch
                  checked={Boolean(values[field.key])}
                  onCheckedChange={(checked) =>
                    setValues((current) => ({ ...current, [field.key]: checked }))
                  }
                />
              </div>
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Select
                value={typeof values[field.key] === "string" ? (values[field.key] as string) : undefined}
                onValueChange={(value) =>
                  setValues((current) => ({ ...current, [field.key]: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choose ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Textarea
                required={field.required}
                placeholder={getFieldPlaceholder(field)}
                value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            </div>
          );
        }

        if (field.type === "document") {
          return (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <p className="text-xs text-muted-foreground">Add richer notes, ideas, or steps.</p>
              <DocumentEditor
                value={Array.isArray(values[field.key]) ? (values[field.key] as never[]) : undefined}
                onChange={(blocks) => {
                  setValues((current) => ({ ...current, [field.key]: blocks }));
                }}
              />
            </div>
          );
        }

        if (field.type === "relation") {
          const selectedRelationIds = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
          const selectedRelationId = typeof values[field.key] === "string" ? values[field.key] : null;
          const selectedRelation = selectedRelationId
            ? relationOptions?.[field.key]?.find((option) => option.id === selectedRelationId)
            : null;

          return (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Select
                value={field.multiple ? undefined : selectedRelationId ?? undefined}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: field.multiple
                      ? Array.from(new Set([...(Array.isArray(current[field.key]) ? (current[field.key] as string[]) : []), value]))
                      : value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choose ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {(relationOptions?.[field.key] ?? []).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!field.multiple && selectedRelation ? (
                <button
                  type="button"
                  className="rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground transition hover:bg-muted"
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: null,
                    }))
                  }
                >
                  {selectedRelation.label} ×
                </button>
              ) : null}

              {selectedRelationIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedRelationIds.map((relationId) => {
                    const match = relationOptions?.[field.key]?.find((option) => option.id === relationId);
                    return (
                      <button
                        key={relationId}
                        type="button"
                        className="rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground transition hover:bg-muted"
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            [field.key]: ((Array.isArray(current[field.key]) ? current[field.key] : []) as string[]).filter(
                              (itemId) => itemId !== relationId,
                            ),
                          }))
                        }
                      >
                        {match?.label ?? relationId} ×
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
              required={field.required}
              placeholder={getFieldPlaceholder(field)}
              value={typeof values[field.key] === "string" || typeof values[field.key] === "number" ? String(values[field.key]) : ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value,
                }))
              }
            />
          </div>
        );
      })}

      <Button type="submit" className="rounded-full px-5">
        {mode === "create" ? "Add item" : "Save changes"}
      </Button>
    </form>
  );
}
