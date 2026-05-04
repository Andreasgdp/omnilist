"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDefinition } from "@/shared/lib/list-schema";

const defaultField = (): FieldDefinition => ({
  key: `field_${Math.random().toString(36).slice(2, 8)}`,
  label: "New field",
  type: "text",
  required: false,
});

export function ListSchemaForm({ name = "schema" }: { name?: string }) {
  const [fields, setFields] = useState<FieldDefinition[]>([
    { key: "title", label: "Title", type: "text", required: true },
  ]);

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(fields)} readOnly />

      {fields.map((field, index) => (
        <div key={field.key} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={field.label}
              onChange={(event) => {
                const next = [...fields];
                next[index] = { ...field, label: event.target.value };
                setFields(next);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              value={field.key}
              onChange={(event) => {
                const next = [...fields];
                next[index] = { ...field, key: event.target.value };
                setFields(next);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                const next = [...fields];
                next[index] = { ...field, type: value as FieldDefinition["type"] };
                setFields(next);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="file">File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => {
                  const next = [...fields];
                  next[index] = { ...field, required: checked };
                  setFields(next);
                }}
              />
              <Label>Required</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={field.multiple ?? false}
                onCheckedChange={(checked) => {
                  const next = [...fields];
                  next[index] = { ...field, multiple: checked };
                  setFields(next);
                }}
              />
              <Label>Multiple</Label>
            </div>
          </div>

          {field.type === "select" ? (
            <div className="space-y-2 md:col-span-4">
              <Label>Options (one per line as label:value)</Label>
              <Textarea
                value={(field.options ?? [])
                  .map((option) => `${option.label}:${option.value}`)
                  .join("\n")}
                onChange={(event) => {
                  const next = [...fields];
                  next[index] = {
                    ...field,
                    options: event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [label, value] = line.split(":");
                        return {
                          label: label?.trim() || value?.trim() || line,
                          value: value?.trim() || label?.trim() || line,
                        };
                      }),
                  };
                  setFields(next);
                }}
              />
            </div>
          ) : null}
        </div>
      ))}

      <Button type="button" variant="outline" onClick={() => setFields((current) => [...current, defaultField()])}>
        Add field
      </Button>
    </div>
  );
}
