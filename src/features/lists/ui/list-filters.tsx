"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FieldDefinition } from "@/shared/lib/list-schema";

type Props = {
  fields: FieldDefinition[];
  currentSortField?: string;
  currentSortDir?: "asc" | "desc";
};

export function ListFilters({ fields, currentSortField, currentSortDir }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortField, setSortField] = useState(currentSortField ?? "");
  const [sortDir, setSortDir] = useState(currentSortDir ?? "asc");
  const [filterField, setFilterField] = useState(fields[0]?.key ?? "");
  const [filterValue, setFilterValue] = useState("");

  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_160px_1fr_auto]">
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
            <SelectTrigger>
              <SelectValue placeholder="Newest first" />
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
            <SelectTrigger>
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
              <div className="flex gap-2">
            <Select
              value={filterField}
              onValueChange={(value) => {
                if (value) {
                  setFilterField(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.key} value={field.key}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={filterValue} onChange={(event) => setFilterValue(event.target.value)} placeholder="Search value" />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            className="rounded-full px-5"
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
            className="rounded-full px-5"
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
