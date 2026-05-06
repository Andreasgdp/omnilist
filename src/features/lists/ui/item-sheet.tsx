"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight, PanelRightOpen, Sparkles, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { deleteItemAction } from "@/features/lists/server/actions";
import { ItemForm } from "@/features/lists/ui/item-form";
import type { FieldDefinition } from "@/shared/lib/list-schema";
import { routes } from "@/shared/lib/routes";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ItemSheet({
  trigger,
  mode,
  workspaceId,
  workspaceSlug,
  listId,
  itemId,
  insertAt,
  fields,
  relationOptions,
  initialValues,
  viewMode = "side",
}: {
  trigger: ReactElement;
  mode: "create" | "edit";
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  itemId?: string;
  insertAt?: number;
  fields: FieldDefinition[];
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  initialValues?: Record<string, unknown>;
  viewMode?: "side" | "center";
}) {
  const itemTitle = typeof initialValues?.[fields[0]?.key] === "string" ? String(initialValues?.[fields[0]?.key]) : "Untitled item";
  const itemHref = itemId ? routes.listItem(workspaceSlug, listId, itemId) : null;

  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent side={viewMode === "center" ? "center" : "right"} className={viewMode === "center" ? "overflow-y-auto" : "w-full overflow-y-auto sm:max-w-2xl"}>
        <SheetHeader className="border-b border-border/60 pb-5 pr-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {viewMode === "center" ? <Square className="mr-1.5 size-3.5" /> : <PanelRightOpen className="mr-1.5 size-3.5" />}
                {viewMode === "center" ? "Center peek" : mode === "create" ? "Quick capture" : "Side peek"}
              </Badge>
              {mode === "edit" ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5" />
                  Property-focused editing
                </span>
              ) : null}
            </div>

            {mode === "edit" && itemId ? (
              <div className="flex items-center gap-2">
                {itemHref ? (
                  <Link
                    href={itemHref}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full px-3")}
                  >
                    <ArrowUpRight className="size-4" />
                    Full page
                  </Link>
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground" aria-label="More item actions" />}>
                    <Square className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {itemHref ? (
                      <DropdownMenuItem render={<Link href={itemHref} />}>
                        <ArrowUpRight className="size-4" />
                        Open as full page
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Change the default open mode from the list toolbar or the main options menu.
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 pt-2">
            <SheetTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">{mode === "create" ? "Add item" : itemTitle}</SheetTitle>
            <SheetDescription className="max-w-2xl text-sm">
              {mode === "create"
                ? "Capture a new item without leaving the list."
                : "Edit the key properties here, then open the full page when you want a roomier writing surface."}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="px-4 pb-4 pt-5 sm:px-6">
          <ItemForm
            mode={mode}
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            listId={listId}
            itemId={itemId}
            insertAt={insertAt}
            fields={fields}
            relationOptions={relationOptions}
            initialValues={initialValues}
            showHeader={false}
          />

          {mode === "edit" && itemId ? (
            <form action={deleteItemAction} className="mt-4 border-t border-border/60 pt-4">
              <input type="hidden" name="workspaceId" value={workspaceId} />
              <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
              <input type="hidden" name="listId" value={listId} />
              <input type="hidden" name="itemId" value={itemId} />
              <Button type="submit" variant="ghost" className="rounded-full text-destructive">
                Delete item
              </Button>
            </form>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
