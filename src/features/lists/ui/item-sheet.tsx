"use client";

import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { deleteItemAction } from "@/features/lists/server/actions";
import { ItemForm } from "@/features/lists/ui/item-form";
import type { FieldDefinition } from "@/shared/lib/list-schema";

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
}) {
  const itemTitle = typeof initialValues?.[fields[0]?.key] === "string" ? String(initialValues?.[fields[0]?.key]) : "Untitled item";

  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "Add item" : itemTitle}</SheetTitle>
          <SheetDescription>
            {mode === "create" ? "Capture a new item without leaving the list." : "Edit the details for this item in one place."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
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
