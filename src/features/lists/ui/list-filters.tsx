"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { ListQueryState } from "@/features/lists/lib/query-state";
import type { FieldDefinition } from "@/shared/lib/list-schema";

type Props = {
  fields: FieldDefinition[];
  queryState: ListQueryState;
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
};

export function ListFilters({ fields, queryState, relationOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstFilter = queryState.filters[0];
  const [sortField, setSortField] = useState(queryState.sortField ?? "");
  const [sortDir, setSortDir] = useState(queryState.sortDir ?? "asc");
  const [filterField, setFilterField] = useState(firstFilter?.field ?? fields[0]?.key ?? "");
  const [filterValue, setFilterValue] = useState(firstFilter?.value ?? "");
  const selectedSortField = fields.find((field) => field.key === sortField);
  const selectedFilterField = fields.find((field) => field.key === filterField);
  const selectedFilterValueLabel = selectedFilterField?.type === "select"
    ? selectedFilterField.options?.find((option) => option.value === filterValue)?.label
    : selectedFilterField?.type === "relation"
      ? relationOptions?.[selectedFilterField.key]?.find((option) => option.id === filterValue)?.label
      : undefined;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-2 py-1 shadow-sm">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <ArrowUpDown className="size-3.5" />
          Sort
        </span>
        <div className="w-36 sm:w-44">
          <Select
            value={sortField || undefined}
            onValueChange={(value) => {
              if (value) {
                setSortField(value);
              }
            }}
          >
            <SelectTrigger className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4">
              <span className="truncate text-left text-sm">{selectedSortField?.label ?? "Newest first"}</span>
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.key} value={field.key}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-28">
          <Select value={sortDir} onValueChange={(value) => setSortDir(value as "asc" | "desc")}>
            <SelectTrigger className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4">
              <span className="truncate text-left text-sm">{sortDir === "desc" ? "Descending" : "Ascending"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-full border border-border/70 bg-background/75 px-2 py-1 shadow-sm">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Filter className="size-3.5" />
          Filter
        </span>
        <div className="w-36 sm:w-44">
            <Select
              value={filterField}
              onValueChange={(value) => {
                if (value) {
                  setFilterField(value);
                }
              }}
            >
              <SelectTrigger className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4">
                <span className="truncate text-left text-sm">{selectedFilterField?.label ?? "Choose a field"}</span>
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.key} value={field.key}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        <div className="min-w-[12rem] flex-1 sm:min-w-[14rem]">
          {selectedFilterField?.type === "select" ? (
            <Select value={filterValue || undefined} onValueChange={(value) => setFilterValue(value ?? "")}>
              <SelectTrigger className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4">
                  <span className="truncate text-left text-sm">{selectedFilterValueLabel ?? "Choose a value"}</span>
              </SelectTrigger>
              <SelectContent>
                {(selectedFilterField.options ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : selectedFilterField?.type === "relation" ? (
            <Select value={filterValue || undefined} onValueChange={(value) => setFilterValue(value ?? "")}>
              <SelectTrigger className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4">
                  <span className="truncate text-left text-sm">{selectedFilterValueLabel ?? "Choose an item"}</span>
              </SelectTrigger>
              <SelectContent>
                {(relationOptions?.[selectedFilterField.key] ?? []).map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={filterValue} onChange={(event) => setFilterValue(event.target.value)} placeholder="Search value" className="h-8 rounded-full border-0 bg-transparent px-3 shadow-none transition-all duration-200 hover:bg-primary/4 focus-visible:ring-2" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="motion-press rounded-full px-4"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());

            if (sortField) {
              params.set("sortField", sortField);
              params.set("sortDir", sortDir);
            } else {
              params.delete("sortField");
              params.delete("sortDir");
            }

            if (filterField && filterValue) {
              params.set(
                "filters",
                JSON.stringify([
                  {
                    field: filterField,
                    op: "contains",
                    value: filterValue,
                  },
                ]),
              );
            } else {
              params.delete("filters");
            }

            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          Apply
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="motion-press rounded-full px-4 text-muted-foreground"
          onClick={() => {
            router.push(pathname);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
