"use client";

import Link from "next/link";
import { ArrowUpRight, Ellipsis, PanelRightOpen, Settings2, Share2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";
import { SaveViewForm } from "@/features/lists/ui/save-view-form";
import type { FieldDefinition } from "@/shared/lib/list-schema";
import { routes } from "@/shared/lib/routes";
import { NavLink } from "@/shared/ui/nav-link";

export function ListPageActions({
  listId,
  workspaceId,
  workspaceSlug,
  queryState,
  fields,
  relationOptions,
  itemViewMode,
}: {
  listId: string;
  workspaceId: string;
  workspaceSlug: string;
  queryState: ListQueryState;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  itemViewMode: "side" | "center" | "full";
}) {
  const hrefForMode = (nextMode: "side" | "center" | "full") => {
    const query = serializeListQueryState({
      ...queryState,
      itemView: nextMode,
    });

    return query ? `${routes.list(workspaceSlug, listId)}?${query}` : routes.list(workspaceSlug, listId);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="More view options"
          />
        }
      >
        <Ellipsis className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[24rem] rounded-3xl p-4">
        <PopoverHeader>
          <PopoverTitle>View options</PopoverTitle>
          <PopoverDescription>Save this setup, then jump back to it whenever you need it.</PopoverDescription>
        </PopoverHeader>

        <SaveViewForm
          listId={listId}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          queryState={queryState}
          fields={fields}
          relationOptions={relationOptions}
          compact
        />

        <div className="mt-4 grid gap-2 border-t border-border/60 pt-4">
          <div className="space-y-2 rounded-2xl bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Open items in</p>
            <div className="grid gap-2">
              <NavLink href={hrefForMode("side")} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${itemViewMode === "side" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"}`}>
                <PanelRightOpen className="size-4" />
                Side peek
              </NavLink>
              <NavLink href={hrefForMode("center")} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${itemViewMode === "center" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"}`}>
                <Square className="size-4" />
                Center peek
              </NavLink>
              <NavLink href={hrefForMode("full")} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${itemViewMode === "full" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"}`}>
                <ArrowUpRight className="size-4" />
                Full page
              </NavLink>
            </div>
          </div>

          <Link
            href={routes.listShare(workspaceSlug, listId)}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Share2 className="size-4" />
            Share list
          </Link>
          <Link
            href={routes.listSettings(workspaceSlug, listId)}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Settings2 className="size-4" />
            List settings
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
