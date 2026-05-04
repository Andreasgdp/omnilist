import { z } from "zod";

export const filterOperatorSchema = z.enum(["contains", "equals", "gt", "lt"]);

export const listFilterSchema = z.object({
  field: z.string().min(1),
  op: filterOperatorSchema,
  value: z.string().min(1),
});

export const listQueryStateSchema = z.object({
  sortField: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  filters: z.array(listFilterSchema).default([]),
});

export type ListQueryState = z.infer<typeof listQueryStateSchema>;

export const parseListQueryState = (searchParams: Record<string, string | string[] | undefined>) => {
  const sortField = typeof searchParams.sortField === "string" ? searchParams.sortField : undefined;
  const sortDir = typeof searchParams.sortDir === "string" ? searchParams.sortDir : undefined;
  const filtersRaw = typeof searchParams.filters === "string" ? searchParams.filters : undefined;

  let filters: ListQueryState["filters"] = [];
  if (filtersRaw) {
    try {
      filters = listFilterSchema.array().parse(JSON.parse(filtersRaw));
    } catch {
      filters = [];
    }
  }

  return listQueryStateSchema.parse({
    sortField,
    sortDir,
    filters,
  });
};

export const serializeListQueryState = (state: ListQueryState) => {
  const params = new URLSearchParams();

  if (state.sortField) {
    params.set("sortField", state.sortField);
  }

  if (state.sortDir) {
    params.set("sortDir", state.sortDir);
  }

  if (state.filters.length > 0) {
    params.set("filters", JSON.stringify(state.filters));
  }

  return params.toString();
};
