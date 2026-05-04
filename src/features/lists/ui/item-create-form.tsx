"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createItemAction } from "@/features/lists/server/actions";
import type { FieldDefinition } from "@/shared/lib/list-schema";

type Props = {
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  fields: FieldDefinition[];
};

export function ItemCreateForm({ workspaceId, workspaceSlug, listId, fields }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const payload = useMemo(() => JSON.stringify(values), [values]);

  return (
    <form action={createItemAction} className="space-y-4 rounded-lg border bg-card p-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="payload" value={payload} readOnly />

      <h3 className="text-lg font-semibold">Add item</h3>

      {fields.map((field) => {
        if (field.type === "boolean") {
          return (
            <div key={field.key} className="flex items-center justify-between gap-4">
              <Label>{field.label}</Label>
              <Switch
                checked={Boolean(values[field.key])}
                onCheckedChange={(checked) =>
                  setValues((current) => ({ ...current, [field.key]: checked }))
                }
              />
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Select
                onValueChange={(value) =>
                  setValues((current) => ({ ...current, [field.key]: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
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
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
              required={field.required}
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

      <Button type="submit">Add item</Button>
    </form>
  );
}
