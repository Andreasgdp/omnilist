"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DocumentEditor } from "@/features/lists/ui/document-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createItemAction, updateItemAction } from "@/features/lists/server/actions";
import { itemPageContentKey, type FieldDefinition, type DocumentBlock } from "@/shared/lib/list-schema";
import { FieldTypeIcon } from "@/shared/ui/field-type-icon";

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
  showHeader?: boolean;
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
  showHeader = true,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const titleField = fields.find((field) => field.key === "title") ?? fields[0];
  const descriptionField = fields.find((field) => field.key === "description");
  const orderedFields = [titleField, descriptionField, ...fields.filter((field) => field.key !== titleField?.key && field.key !== descriptionField?.key)].filter((field): field is FieldDefinition => Boolean(field));

  const clearValue = (fieldKey: string) => {
    setValues((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  };

  const payload = useMemo(() => JSON.stringify(values), [values]);
  const action = mode === "create" ? createItemAction : updateItemAction;
  const pageContentValue = Array.isArray(values[itemPageContentKey]) ? (values[itemPageContentKey] as DocumentBlock[]) : undefined;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="listId" value={listId} />
      {itemId ? <input type="hidden" name="itemId" value={itemId} /> : null}
      {typeof insertAt === "number" ? <input type="hidden" name="insertAt" value={String(insertAt)} /> : null}
      <input type="hidden" name="payload" value={payload} readOnly />

      {showHeader ? (
        <div>
          <h3 className="text-lg font-semibold">{mode === "create" ? "Add item" : "Edit item"}</h3>
          <p className="text-sm text-muted-foreground">Fill in the details below. Keep it light now and add more later.</p>
        </div>
      ) : null}

      <div className="space-y-2">
      {orderedFields.map((field) => {
        const fieldLabel = (
          <span className="inline-flex items-center gap-2">
            <FieldTypeIcon type={field.type} className="size-4 text-muted-foreground" />
            {field.label}
          </span>
        );
        const selectedOptionLabel =
          typeof values[field.key] === "string"
            ? field.options?.find((option) => option.value === values[field.key])?.label
            : undefined;
        const isTitleField = field.key === titleField?.key;
        const isDescriptionField = field.key === descriptionField?.key;
        const surfaceClassName = isTitleField || isDescriptionField
          ? "space-y-2"
          : "grid gap-3 rounded-xl px-1 py-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start";

        if (field.type === "boolean") {
          return (
            <div key={field.key} className="grid gap-3 rounded-xl px-1 py-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>{fieldLabel}</Label>
                </div>
              </div>
              <div className="flex min-h-8 items-center">
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
          const selectedValues = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
          return (
            <div key={field.key} className={surfaceClassName}>
              <Label>{fieldLabel}</Label>
              <Select
                value={!field.multiple && typeof values[field.key] === "string" ? (values[field.key] as string) : undefined}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: field.multiple
                      ? Array.from(new Set([...(Array.isArray(current[field.key]) ? (current[field.key] as string[]) : []), value]))
                      : value,
                  }))
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <span className="truncate text-left text-sm">
                    {field.multiple
                      ? selectedValues.length > 0
                        ? `${selectedValues.length} selected`
                        : `Choose ${field.label.toLowerCase()}`
                      : selectedOptionLabel ?? `Choose ${field.label.toLowerCase()}`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {field.multiple && selectedValues.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedValues.map((selectedValue) => {
                    const selectedOption = field.options?.find((option) => option.value === selectedValue);
                    return (
                      <button
                        key={selectedValue}
                        type="button"
                        className="rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground transition hover:bg-muted"
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            [field.key]: ((Array.isArray(current[field.key]) ? current[field.key] : []) as string[]).filter(
                              (value) => value !== selectedValue,
                            ),
                          }))
                        }
                      >
                        {selectedOption?.label ?? selectedValue} ×
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} className={surfaceClassName}>
              <Label className={isTitleField || isDescriptionField ? undefined : "pt-2 text-sm text-muted-foreground"}>{fieldLabel}</Label>
              <Textarea
                required={field.required}
                placeholder={getFieldPlaceholder(field)}
                value={typeof values[field.key] === "string" ? (values[field.key] as string) : ""}
                className={isTitleField ? "min-h-[4.8rem] border-0 bg-transparent px-0 text-3xl font-semibold leading-tight shadow-none focus-visible:ring-0 sm:text-4xl" : isDescriptionField ? "min-h-[3.25rem] rounded-xl border-0 bg-transparent px-0 text-muted-foreground shadow-none focus-visible:ring-0" : "min-h-[2.75rem] rounded-xl border-border/60 bg-background/55"}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            </div>
          );
        }

        if (field.type === "document") {
          return (
            <div key={field.key} className={surfaceClassName}>
              <div className="space-y-1 pt-2">
                <Label className="text-sm text-muted-foreground">{fieldLabel}</Label>
                <p className="text-xs text-muted-foreground">Add richer notes, ideas, or steps.</p>
              </div>
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
            <div key={field.key} className={surfaceClassName}>
              <Label className="pt-2 text-sm text-muted-foreground">{fieldLabel}</Label>
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
                  <SelectTrigger className="w-full rounded-xl">
                    <span className="truncate text-left text-sm">
                      {selectedRelation?.label ?? `Choose ${field.label.toLowerCase()}`}
                    </span>
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
                  onClick={() => clearValue(field.key)}
                >
                  {selectedRelation.label} ×
                </button>
              ) : null}

              {selectedRelationIds.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
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
          <div key={field.key} className={surfaceClassName}>
            <Label className={isTitleField ? undefined : "pt-2 text-sm text-muted-foreground"}>{fieldLabel}</Label>
            <Input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
              required={field.required}
              placeholder={getFieldPlaceholder(field)}
              value={typeof values[field.key] === "string" || typeof values[field.key] === "number" ? String(values[field.key]) : ""}
              className={isTitleField ? "h-14 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0 sm:text-4xl" : "rounded-xl border-border/60 bg-background/55"}
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
      </div>

      <div className="space-y-3 pt-1">
        <div className="border-t border-border/55 pt-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Page content</Label>
            <p className="text-sm text-muted-foreground">Write freely here with richer notes, structure, media, tables, and commands.</p>
          </div>
        </div>
        <DocumentEditor
          value={pageContentValue}
          variant="page"
          onChange={(blocks) => {
            setValues((current) => ({
              ...current,
              [itemPageContentKey]: blocks,
            }));
          }}
        />
      </div>

      <Button type="submit" className="rounded-full px-5">
        {mode === "create" ? "Add item" : "Save changes"}
      </Button>
    </form>
  );
}
