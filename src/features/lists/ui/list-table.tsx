"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";
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
  const extraColumnCount = canEditSchema ? 2 : 0;
  const addRowColSpan = fields.length + extraColumnCount;
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [pressedItemId, setPressedItemId] = useState<string | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Record<string, boolean>>({});
  const reorderFormRef = useRef<HTMLFormElement>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const holdTimerRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const orderedItemIdsPayload = useMemo(() => JSON.stringify(orderedItems.map((item) => item.id)), [orderedItems]);
  const draggedIndex = draggedItemId ? orderedItems.findIndex((item) => item.id === draggedItemId) : -1;
  const draggedItem = draggedItemId ? orderedItems.find((item) => item.id === draggedItemId) : null;
  const draggedItemTitle = draggedItem ? String(draggedItem.data[titleFieldKey ?? ""] ?? "Untitled item") : null;
  const mobilePrimaryFields = [
    fields.find((field) => field.key === "title"),
    fields.find((field) => field.key === "description"),
  ].filter((field): field is FieldDefinition => Boolean(field));
  const fallbackMobileFields = fields.filter((field) => !mobilePrimaryFields.some((primaryField) => primaryField.key === field.key));
  const mobileVisibleFields = [...mobilePrimaryFields, ...fallbackMobileFields].slice(0, Math.min(fields.length, 2));
  const mobileVisibleFieldKeys = new Set(mobileVisibleFields.map((field) => field.key));
  const hiddenFieldCount = Math.max(0, fields.length - mobileVisibleFields.length);

  const getInsertionIndex = useCallback((fromIndex: number, visualDropIndex: number) => {
    if (fromIndex === -1) {
      return visualDropIndex;
    }

    return visualDropIndex > fromIndex ? visualDropIndex - 1 : visualDropIndex;
  }, []);

  const moveItem = useCallback((fromItemId: string, toIndex: number) => {
    setOrderedItems((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromItemId);

      if (fromIndex === -1) {
        return current;
      }

      const next = [...current];
      const [movedItem] = next.splice(fromIndex, 1);
      const insertionIndex = getInsertionIndex(fromIndex, toIndex);
      const boundedIndex = Math.max(0, Math.min(insertionIndex, next.length));
      next.splice(boundedIndex, 0, movedItem);
      return next;
    });

    requestAnimationFrame(() => {
      reorderFormRef.current?.requestSubmit();
    });

    setDropIndex(null);
    setDraggedItemId(null);
    setPointerPosition(null);
    setPressedItemId(null);
    setReorderNotice("Item moved");
    window.setTimeout(() => setReorderNotice(null), 1600);
  }, [getInsertionIndex]);

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const getDropIndexFromPointer = useCallback((pointerY: number) => {
    for (let index = 0; index < orderedItems.length; index += 1) {
      const row = rowRefs.current[orderedItems[index]?.id];

      if (!row) {
        continue;
      }

      const rect = row.getBoundingClientRect();
      if (pointerY < rect.top + rect.height / 2) {
        return index;
      }
    }

    return orderedItems.length;
  }, [orderedItems]);

  useEffect(() => {
    if (!draggedItemId) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setPointerPosition({ x: event.clientX, y: event.clientY });
      setDropIndex(getDropIndexFromPointer(event.clientY));

      const edgeThreshold = 88;
      const topDistance = event.clientY;
      const bottomDistance = window.innerHeight - event.clientY;

      if (topDistance < edgeThreshold) {
        window.scrollBy({ top: -Math.max(6, (edgeThreshold - topDistance) * 0.35) });
      } else if (bottomDistance < edgeThreshold) {
        window.scrollBy({ top: Math.max(6, (edgeThreshold - bottomDistance) * 0.35) });
      }
    };

    const handlePointerUp = () => {
      clearHoldTimer();

      if (draggedItemId && dropIndex !== null) {
        moveItem(draggedItemId, dropIndex);
        return;
      }

      setDraggedItemId(null);
      setDropIndex(null);
      setPointerPosition(null);
      setPressedItemId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [draggedItemId, dropIndex, getDropIndexFromPointer, moveItem]);

  const getRowMotionClass = (index: number) => {
    if (draggedIndex === -1 || dropIndex === null || index === draggedIndex) {
      return "";
    }

    if (draggedIndex < dropIndex && index > draggedIndex && index < dropIndex) {
      return "-translate-y-4 scale-[1.01] md:-translate-y-5";
    }

    if (draggedIndex > dropIndex && index >= dropIndex && index < draggedIndex) {
      return "translate-y-4 scale-[1.01] md:translate-y-5";
    }

    return "";
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
              {canEditSchema ? <TableHead className="w-10" /> : null}
              {fields.map((field) => (
                <TableHead key={field.key} className={mobileVisibleFieldKeys.has(field.key) ? "" : "hidden md:table-cell"}>
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
                                } ${draggedItemId ? "pointer-events-none" : ""}`}
                              >
                                <Plus className="size-4" />
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
                    ref={(node) => {
                      rowRefs.current[item.id] = node;
                    }}
                    className={`group transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/40 ${
                      draggedItemId === item.id ? "scale-[0.985] bg-muted/50 opacity-30 shadow-sm" : ""
                    } ${getRowMotionClass(index)}`}
                  >
                    {canEditSchema ? (
                      <TableCell className="w-10 pr-0">
                        <button
                          type="button"
                          className={`inline-flex cursor-grab touch-none select-none items-center justify-center rounded-full p-1.5 text-muted-foreground transition-all active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100 ${
                            pressedItemId === item.id ? "scale-110 bg-muted text-foreground shadow-sm" : "opacity-100"
                          }`}
                          aria-label={`Drag ${String(item.data[titleFieldKey ?? ""] ?? "item")}`}
                          aria-keyshortcuts="ArrowUp ArrowDown"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            clearHoldTimer();
                            setPressedItemId(item.id);

                            const startDrag = () => {
                              setDraggedItemId(item.id);
                              setPointerPosition({ x: event.clientX, y: event.clientY });
                              setDropIndex(index);
                              setPressedItemId(null);
                            };

                            if (event.pointerType === "touch") {
                              holdTimerRef.current = window.setTimeout(startDrag, 180);
                              return;
                            }

                            startDrag();
                          }}
                          onPointerUp={() => {
                            clearHoldTimer();
                            setPressedItemId(null);
                          }}
                          onPointerCancel={() => {
                            clearHoldTimer();
                            setPressedItemId(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "ArrowUp") {
                              event.preventDefault();
                              moveItem(item.id, Math.max(0, index - 1));
                            }

                            if (event.key === "ArrowDown") {
                              event.preventDefault();
                              moveItem(item.id, Math.min(orderedItems.length, index + 2));
                            }
                          }}
                        >
                          <GripVertical className="size-4" />
                        </button>
                      </TableCell>
                    ) : null}

                    {fields.map((field) => {
                      const value = item.data[field.key];
                      const cellClassName = mobileVisibleFieldKeys.has(field.key) ? "" : "hidden md:table-cell";

                      if (field.key === titleFieldKey) {
                        return (
                          <TableCell key={field.key} className={`w-[18rem] md:w-[22rem] ${cellClassName}`}>
                            <ItemSheet
                              trigger={
                                <Button
                                  variant="ghost"
                                  className="h-auto w-full justify-between px-0 text-left font-medium text-foreground hover:bg-transparent"
                                >
                                  <span className="truncate">{value ? String(value) : "Untitled item"}</span>
                                  <span className="ml-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden="true">
                                    <ChevronRight className="size-4" />
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
                          <TableCell key={field.key} className={cellClassName}>
                            <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
                          </TableCell>
                        );
                      }

                      if (Array.isArray(value)) {
                        if (field.type === "relation") {
                          return (
                            <TableCell key={field.key} className={cellClassName}>
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
                            <TableCell key={field.key} className={cellClassName}>
                              <Badge variant="outline">{value.length} block(s)</Badge>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={field.key} className={cellClassName}>
                            <Badge variant="outline">{value.length} file(s)</Badge>
                          </TableCell>
                        );
                      }

                      if (field.type === "relation" && typeof value === "string") {
                        const related = relatedById?.[value];
                        const label = related?.data.title ?? related?.data.name ?? value;
                        return (
                          <TableCell key={field.key} className={cellClassName}>
                            <Badge variant="outline">{String(label)}</Badge>
                          </TableCell>
                        );
                      }

                      if (field.type === "document") {
                        return <TableCell key={field.key} className={cellClassName}><Badge variant="outline">Rich document</Badge></TableCell>;
                      }

                      return <TableCell key={field.key} className={cellClassName}>{value ? String(value) : "-"}</TableCell>;
                    })}
                    {canEditSchema ? (
                      <TableCell className="text-right">
                        {hiddenFieldCount > 0 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-full md:hidden"
                            onClick={() =>
                              setExpandedMobileItems((current) => ({
                                ...current,
                                [item.id]: !current[item.id],
                              }))
                            }
                          >
                            {expandedMobileItems[item.id] ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </Button>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>

                  {hiddenFieldCount > 0 && expandedMobileItems[item.id] ? (
                    <TableRow className="border-0 md:hidden">
                      <TableCell colSpan={addRowColSpan} className="pt-0 text-xs text-muted-foreground">
                        <div className="rounded-xl bg-muted/30 px-3 py-2">
                          {fields.filter((field) => !mobileVisibleFieldKeys.has(field.key)).map((field) => {
                            const value = item.data[field.key];
                            return (
                              <div key={`${item.id}-${field.key}`} className="flex items-center justify-between gap-3 py-1">
                                <span>{field.label}</span>
                                <span className="truncate text-right text-foreground">
                                  {Array.isArray(value)
                                    ? `${value.length} item${value.length === 1 ? "" : "s"}`
                                    : typeof value === "boolean"
                                      ? value ? "Yes" : "No"
                                      : value ? String(value) : "-"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))
            )}

            {orderedItems.length > 0 && canEditSchema ? (
              <TableRow className="group/insert-bottom">
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
                          } ${draggedItemId ? "pointer-events-none" : ""}`}
                          aria-label="Add item at the end"
                        >
                          <Plus className="size-4" />
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

        {draggedItemId && pointerPosition && draggedItemTitle ? (
          <div
            className="pointer-events-none fixed left-0 top-0 z-50 rounded-xl border border-border/70 bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-xl backdrop-blur-sm transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate(${pointerPosition.x + 16}px, ${pointerPosition.y + 16}px) rotate(1.5deg) scale(1.02)` }}
          >
            {draggedItemTitle}
          </div>
        ) : null}

        {reorderNotice ? (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border/70 bg-background/95 px-4 py-2 text-sm text-foreground shadow-lg backdrop-blur-sm">
            {reorderNotice}
          </div>
        ) : null}
      </div>
    </div>
  );
}
