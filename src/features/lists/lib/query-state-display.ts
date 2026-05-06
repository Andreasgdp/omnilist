import type { ListQueryState } from "@/features/lists/lib/query-state";
import type { FieldDefinition } from "@/shared/lib/list-schema";

const getField = (fields: FieldDefinition[], fieldKey?: string) => {
  return fields.find((field) => field.key === fieldKey);
};

export const getQueryValueLabel = ({
  field,
  value,
  relationOptions,
}: {
  field?: FieldDefinition;
  value?: string;
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
}) => {
  if (!field || !value) {
    return undefined;
  }

  if (field.type === "select") {
    return field.options?.find((option) => option.value === value)?.label ?? value;
  }

  if (field.type === "relation") {
    return relationOptions?.[field.key]?.find((option) => option.id === value)?.label ?? value;
  }

  return value;
};

export const describeQueryState = ({
  state,
  fields,
  relationOptions,
}: {
  state: ListQueryState;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
}) => {
  const parts: string[] = [];

  if (state.sortField) {
    const sortField = getField(fields, state.sortField);
    parts.push(`Sort: ${sortField?.label ?? "Unknown field"} (${state.sortDir === "desc" ? "descending" : "ascending"})`);
  }

  for (const filter of state.filters) {
    const field = getField(fields, filter.field);
    const valueLabel = getQueryValueLabel({
      field,
      value: filter.value,
      relationOptions,
    });
    parts.push(`Filter: ${field?.label ?? "Unknown field"} contains ${valueLabel ?? filter.value}`);
  }

  return parts;
};
