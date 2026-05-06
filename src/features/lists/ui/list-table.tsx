"use client";

import { Fragment, useRef } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemSheet } from "@/features/lists/ui/item-sheet";
import { AddFieldButton, FieldHeaderEditor } from "@/features/lists/ui/table-field-controls";
import { reorderItemsAction } from "@/features/lists/server/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FieldDefinition } from "@/shared/lib/list-schema";

export function ListTable({
  fields,
  items,
  relatedById,
  workspaceId,
  workspaceSlug,
  listId,
  relationOptions,
  availableLists,
  canEditSchema,
}: {
  fields: FieldDefinition[];
  items: Array<{ id: string; data: Record<string, unknown> }>;
  relatedById?: Record<string, { id: string; data: Record<string, unknown> }>;
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  availableLists: Array<{ id: string; name: string }>;
  canEditSchema: boolean;
}) {
  const itemsKey = useMemo(() => items.map((item) => item.id).join("|"), [items]);

  return <ListTableInner key={itemsKey} {...{ fields, items, relatedById, workspaceId, workspaceSlug, listId, relationOptions, availableLists, canEditSchema }} />;
}

function ListTableInner({
  fields,
  items,
  relatedById,
  workspaceId,
  workspaceSlug,
  listId,
  relationOptions,
  availableLists,
  canEditSchema,
}: {
  fields: FieldDefinition[];
  items: Array<{ id: string; data: Record<string, unknown> }>;
  relatedById?: Record<string, { id: string; data: Record<string, unknown> }>;
  workspaceId: string;
  workspaceSlug: string;
  listId: string;
  relationOptions?: Record<string, Array<{ id: string; label: string }>>;
  availableLists: Array<{ id: string; name: string }>;
  canEditSchema: boolean;
}) {
  const titleFieldKey = fields[0]?.key;
  const addRowColSpan = fields.length + (canEditSchema ? 1 : 0);
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const reorderFormRef = useRef<HTMLFormElement>(null);
  const orderedItemIdsPayload = useMemo(() => JSON.stringify(orderedItems.map((item) => item.id)), [orderedItems]);

  const moveItem = (fromItemId: string, toIndex: number) => {
    setOrderedItems((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromItemId);

      if (fromIndex === -1) {
        return current;
      }

      const next = [...current];
      const [movedItem] = next.splice(fromIndex, 1);
      const boundedIndex = Math.max(0, Math.min(toIndex, next.length));
      next.splice(boundedIndex, 0, movedItem);
      return next;
    });

    requestAnimationFrame(() => {
      reorderFormRef.current?.requestSubmit();
    });

    setDropIndex(null);
    setDraggedItemId(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-sm">
      <div className="overflow-x-auto">
        <form ref={reorderFormRef} action={reorderItemsAction} className="hidden">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
          <input type="hidden" name="listId" value={listId} />
          <input type="hidden" name="orderedItemIds" value={orderedItemIdsPayload} readOnly />
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field.key}>
                  {canEditSchema ? (
                    <FieldHeaderEditor
                      field={field}
                      fieldsCount={fields.length}
                      workspaceId={workspaceId}
                      workspaceSlug={workspaceSlug}
                      listId={listId}
                      availableLists={availableLists}
                    />
                  ) : (
                    field.label
                  )}
                </TableHead>
              ))}
              {canEditSchema ? (
                <TableHead className="w-12 text-right">
                  <AddFieldButton
                    workspaceId={workspaceId}
                    workspaceSlug={workspaceSlug}
                    listId={listId}
                    availableLists={availableLists}
                  />
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={addRowColSpan} className="py-12 text-center text-muted-foreground">
                  <div className="mx-auto max-w-sm space-y-2">
                    <p className="text-base font-medium text-foreground">No items yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start with one entry and this list becomes a living dashboard instead of an empty shell.
                    </p>
                    {canEditSchema ? (
                      <div className="pt-3">
                        <ItemSheet
                          trigger={<Button variant="outline" className="rounded-full">Add first item</Button>}
                          mode="create"
                          workspaceId={workspaceId}
                          workspaceSlug={workspaceSlug}
                          listId={listId}
                          insertAt={0}
                          fields={fields}
                          relationOptions={relationOptions}
                        />
                      </div>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orderedItems.map((item, index) => (
                <Fragment key={item.id}>
                  {canEditSchema ? (
                    <TableRow
                      key={`${item.id}-insert-before`}
                      className="group/insert h-0"
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropIndex(index);
                      }}
                      onDragEnter={() => setDropIndex(index)}
                      onDragLeave={() => setDropIndex((current) => (current === index ? null : current))}
                      onDrop={() => {
                        if (!draggedItemId) {
                          return;
                        }

                        moveItem(draggedItemId, index);
                      }}
                    >
                      <TableCell colSpan={addRowColSpan} className="border-0 p-0">
                        <div className="flex h-4 items-center justify-center overflow-visible">
                          <div
                            className={`absolute h-0.5 w-full rounded-full transition-all duration-150 ${
                              dropIndex === index ? "scale-x-100 bg-primary shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" : "scale-x-95 bg-transparent group-hover/insert:bg-border/80"
                            }`}
                          />
                          <ItemSheet
                            trigger={
                              <Button
                                variant="outline"
                                size="icon-sm"
                                className={`relative z-10 rounded-full border-dashed bg-background transition-all duration-150 ${
                                  dropIndex === index ? "opacity-100 scale-110 border-primary text-primary" : "opacity-0 group-hover/insert:opacity-100"
                                }`}
                              >
                                +
                              </Button>
                            }
                            mode="create"
                            workspaceId={workspaceId}
                            workspaceSlug={workspaceSlug}
                            listId={listId}
                            insertAt={index}
                            fields={fields}
                            relationOptions={relationOptions}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  <TableRow
                    key={item.id}
                    draggable={canEditSchema}
                    onDragStart={() => {
                      setDraggedItemId(item.id);
                    }}
                    onDragEnd={() => {
                      setDraggedItemId(null);
                      setDropIndex(null);
                    }}
                    className={`group transition-all duration-150 hover:bg-muted/40 ${
                      draggedItemId === item.id ? "scale-[0.99] bg-muted/50 opacity-55 shadow-sm" : ""
                    } ${dropIndex === index ? "translate-y-1" : ""}`}
                  >
                    {fields.map((field) => {
                      const value = item.data[field.key];

                      if (field.key === titleFieldKey) {
                        return (
                          <TableCell key={field.key} className="w-[22rem]">
                            <ItemSheet
                              trigger={
                                <Button
                                  variant="ghost"
                                  className="h-auto w-full justify-between px-0 text-left font-medium text-foreground hover:bg-transparent"
                                >
                                  <span className="truncate">{value ? String(value) : "Untitled item"}</span>
                                  <span className="ml-3 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                                    Open
                                  </span>
                                </Button>
                              }
                              mode="edit"
                              workspaceId={workspaceId}
                              workspaceSlug={workspaceSlug}
                              listId={listId}
                              itemId={item.id}
                              fields={fields}
                              relationOptions={relationOptions}
                              initialValues={item.data}
                            />
                          </TableCell>
                        );
                      }

                      if (typeof value === "boolean") {
                        return (
                          <TableCell key={field.key}>
                            <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
                          </TableCell>
                        );
                      }

                      if (Array.isArray(value)) {
                        if (field.type === "relation") {
                          return (
                            <TableCell key={field.key}>
                              <div className="flex flex-wrap gap-2">
                                {value.map((relationId) => {
                                  const related = typeof relationId === "string" ? relatedById?.[relationId] : null;
                                  const label = related?.data.title ?? related?.data.name ?? relationId;
                                  return (
                                    <Badge key={String(relationId)} variant="outline">
                                      {String(label)}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </TableCell>
                          );
                        }

                        if (field.type === "document") {
                          return (
                            <TableCell key={field.key}>
                              <Badge variant="outline">{value.length} block(s)</Badge>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={field.key}>
                            <Badge variant="outline">{value.length} file(s)</Badge>
                          </TableCell>
                        );
                      }

                      if (field.type === "relation" && typeof value === "string") {
                        const related = relatedById?.[value];
                        const label = related?.data.title ?? related?.data.name ?? value;
                        return (
                          <TableCell key={field.key}>
                            <Badge variant="outline">{String(label)}</Badge>
                          </TableCell>
                        );
                      }

                      if (field.type === "document") {
                        return <TableCell key={field.key}><Badge variant="outline">Rich document</Badge></TableCell>;
                      }

                      return <TableCell key={field.key}>{value ? String(value) : "-"}</TableCell>;
                    })}
                    {canEditSchema ? (
                      <TableCell className="w-12 text-right">
                        <span className="inline-flex cursor-grab text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden="true">
                          ⋮⋮
                        </span>
                      </TableCell>
                    ) : null}
                  </TableRow>
                </Fragment>
              ))
            )}

            {orderedItems.length > 0 && canEditSchema ? (
              <TableRow
                className="group/insert-bottom"
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(orderedItems.length);
                }}
                onDragEnter={() => setDropIndex(orderedItems.length)}
                onDragLeave={() => setDropIndex((current) => (current === orderedItems.length ? null : current))}
                onDrop={() => {
                  if (!draggedItemId) {
                    return;
                  }

                  moveItem(draggedItemId, orderedItems.length);
                }}
              >
                <TableCell colSpan={addRowColSpan} className="border-0 py-3 text-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`absolute h-0.5 w-full rounded-full transition-all duration-150 ${
                        dropIndex === orderedItems.length ? "scale-x-100 bg-primary shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" : "scale-x-95 bg-transparent group-hover/insert-bottom:bg-border/80"
                      }`}
                    />
                    <ItemSheet
                      trigger={
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className={`relative z-10 rounded-full border-dashed bg-background transition-all duration-150 ${
                            dropIndex === orderedItems.length ? "opacity-100 scale-110 border-primary text-primary" : "opacity-60 group-hover/insert-bottom:opacity-100"
                          }`}
                        >
                          +
                        </Button>
                      }
                      mode="create"
                      workspaceId={workspaceId}
                      workspaceSlug={workspaceSlug}
                      listId={listId}
                      insertAt={items.length}
                      fields={fields}
                      relationOptions={relationOptions}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
