"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { coreListFields, fieldTypeLabels, type FieldDefinition, type FieldType } from "@/shared/lib/list-schema";
import { FieldTypeIcon } from "@/shared/ui/field-type-icon";

const createFieldKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "field";

const ensureUniqueFieldKey = (fields: FieldDefinition[], desiredKey: string, indexToSkip?: number) => {
  let nextKey = desiredKey;
  let suffix = 2;

  while (fields.some((field, index) => index !== indexToSkip && field.key === nextKey)) {
    nextKey = `${desiredKey}_${suffix}`;
    suffix += 1;
  }

  return nextKey;
};

const createField = ({
  label,
  type,
  fields,
  availableLists,
}: {
  label: string;
  type: FieldType;
  fields: FieldDefinition[];
  availableLists: Array<{ id: string; name: string }>;
}): FieldDefinition => {
  const field: FieldDefinition = {
    key: ensureUniqueFieldKey(fields, createFieldKey(label)),
    label,
    type,
    required: false,
  };

  if (type === "select") {
    field.options = [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
    ];
  }

  if (type === "relation" && availableLists[0]) {
    field.targetListId = availableLists[0].id;
  }

  return field;
};

const quickAddFieldTypes: Array<{ label: string; type: FieldType }> = [
  { label: "Text", type: "text" },
  { label: "Checkbox", type: "boolean" },
  { label: "Choice", type: "select" },
  { label: "Date", type: "date" },
  { label: "Linked item", type: "relation" },
];

const defaultFields: FieldDefinition[] = [{ ...coreListFields.title }, { ...coreListFields.description }];

export function ListSchemaForm({
  name = "schema",
  initialFields,
  availableLists = [],
  allowReorder = false,
}: {
  name?: string;
  initialFields?: FieldDefinition[];
  availableLists?: Array<{ id: string; name: string }>;
  allowReorder?: boolean;
}) {
  const [fields, setFields] = useState<FieldDefinition[]>(
    initialFields && initialFields.length > 0 ? initialFields : defaultFields,
  );

  const updateField = (index: number, nextField: FieldDefinition) => {
    setFields((current) => {
      const next = [...current];
      next[index] = nextField;
      return next;
    });
  };

  const moveField = (index: number, direction: -1 | 1) => {
    setFields((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [field] = next.splice(index, 1);
      next.splice(nextIndex, 0, field);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(fields)} readOnly />

      <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
        <div>
          <p className="text-sm font-medium">Add fields quickly</p>
          <p className="text-sm text-muted-foreground">
            Start simple. New fields are set up automatically from the name you choose.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickAddFieldTypes.map((preset) => (
            <Button
              key={preset.type}
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                setFields((current) => [
                  ...current,
                  createField({
                    label: preset.label,
                    type: preset.type,
                    fields: current,
                    availableLists,
                  }),
                ])
              }
            >
              Add {preset.label.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {fields.map((field, index) => {
        const isCoreField = field.key === coreListFields.title.key || field.key === coreListFields.description.key;

        return (
        <div key={`${field.key}-${index}`} className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 md:grid-cols-4">
          <div className="md:col-span-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Field {index + 1}</p>
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FieldTypeIcon type={field.type} className="size-3.5" />
                {fieldTypeLabels[field.type]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {allowReorder ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => moveField(index, 1)}
                    disabled={index === fields.length - 1}
                  >
                    Move down
                  </Button>
                </>
              ) : null}
              {fields.length > 1 && !isCoreField ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setFields((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={field.label}
              disabled={isCoreField}
              onChange={(event) => {
                updateField(index, { ...field, label: event.target.value });
              }}
            />
            {isCoreField ? <p className="text-xs text-muted-foreground">Built in for every item.</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Type</Label>
            <Select
              value={field.type}
              onValueChange={(value) => {
                if (!value || isCoreField) {
                  return;
                }

                const nextType = value as FieldType;
                const nextField: FieldDefinition = { ...field, type: nextType };

                if (nextType === "select" && (!field.options || field.options.length === 0)) {
                  nextField.options = [
                    { label: "Option 1", value: "option_1" },
                    { label: "Option 2", value: "option_2" },
                  ];
                }

                if (nextType === "relation" && !field.targetListId && availableLists[0]) {
                  nextField.targetListId = availableLists[0].id;
                }

                updateField(index, nextField);
              }}
            >
              <SelectTrigger>
                <span className="inline-flex items-center gap-2 text-sm">
                  <FieldTypeIcon type={field.type} className="size-4 text-muted-foreground" />
                  <span>{fieldTypeLabels[field.type]}</span>
                </span>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <span className="inline-flex items-center gap-2">
                      <FieldTypeIcon type={value as FieldType} className="size-4 text-muted-foreground" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={field.required}
                disabled={isCoreField}
                onCheckedChange={(checked) => {
                  updateField(index, { ...field, required: checked });
                }}
              />
              <Label>Required</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={field.multiple ?? false}
                disabled={isCoreField}
                onCheckedChange={(checked) => {
                  updateField(index, { ...field, multiple: checked });
                }}
              />
              <Label>Allow more than one</Label>
            </div>
          </div>

          {field.type === "select" ? (
            <div className="space-y-2 md:col-span-4">
              <Label>Choices</Label>
              <Textarea
                placeholder={"Dinner\nBrunch\nCoffee"}
                value={(field.options ?? [])
                  .map((option) => `${option.label}:${option.value}`)
                  .join("\n")}
                onChange={(event) => {
                  updateField(index, {
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
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">Add one choice per line. You can also use `label:value` if you want a custom saved value.</p>
            </div>
          ) : null}

          {field.type === "relation" ? (
            <div className="space-y-2 md:col-span-4">
              <Label>Link to list</Label>
              <Select
                value={field.targetListId ?? undefined}
                onValueChange={(value) =>
                  updateField(index, { ...field, targetListId: value ?? undefined })
                }
              >
                <SelectTrigger>
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
              {availableLists.length === 0 ? (
                <p className="text-xs text-muted-foreground">Create another list first, then you can link items to it here.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      );})}

      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() =>
          setFields((current) => [
            ...current,
            createField({
              label: "New field",
              type: "text",
              fields: current,
              availableLists,
            }),
          ])
        }
      >
        Add field
      </Button>
    </div>
  );
}
