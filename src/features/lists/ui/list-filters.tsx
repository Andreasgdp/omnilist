"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_160px_1fr_auto]">
        <div className="space-y-2">
          <Label>Sort field</Label>
          <Select
            value={sortField || undefined}
            onValueChange={(value) => {
              if (value) {
                setSortField(value);
              }
            }}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/60 hover:bg-primary/4">
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

        <div className="space-y-2">
          <Label>Direction</Label>
          <Select value={sortDir} onValueChange={(value) => setSortDir(value as "asc" | "desc")}>
            <SelectTrigger className="transition-all duration-200 hover:border-primary/60 hover:bg-primary/4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Contains filter</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={filterField}
              onValueChange={(value) => {
                if (value) {
                  setFilterField(value);
                }
              }}
            >
              <SelectTrigger className="transition-all duration-200 hover:border-primary/60 hover:bg-primary/4">
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

            {selectedFilterField?.type === "select" ? (
              <Select value={filterValue || undefined} onValueChange={(value) => setFilterValue(value ?? "")}>
                <SelectTrigger className="transition-all duration-200 hover:border-primary/60 hover:bg-primary/4">
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
                <SelectTrigger className="transition-all duration-200 hover:border-primary/60 hover:bg-primary/4">
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
              <Input value={filterValue} onChange={(event) => setFilterValue(event.target.value)} placeholder="Search value" className="transition-all duration-200 hover:border-primary/60 focus-visible:scale-[1.01]" />
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <Button
            type="button"
            className="motion-press rounded-full px-5 shadow-sm shadow-primary/10"
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
            variant="outline"
            className="motion-press rounded-full px-5"
            onClick={() => {
              router.push(pathname);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
