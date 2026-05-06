"use client";

import { usePathname, useRouter } from "next/navigation";
import { PanelRightOpen, Square, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { serializeListQueryState, type ListQueryState } from "@/features/lists/lib/query-state";

export function ItemViewModePicker({
  itemViewMode,
  queryState,
}: {
  itemViewMode: "side" | "center" | "full";
  queryState: ListQueryState;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const setMode = (nextMode: string) => {
    const params = serializeListQueryState({
      ...queryState,
      itemView: nextMode as ListQueryState["itemView"],
    });

    router.push(params ? `${pathname}?${params}` : pathname);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Choose item open mode" />}>
        {itemViewMode === "full" ? <ArrowUpRight className="size-4" /> : itemViewMode === "center" ? <Square className="size-4" /> : <PanelRightOpen className="size-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Open items in</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={itemViewMode} onValueChange={setMode}>
          <DropdownMenuRadioItem value="side">Side peek</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="center">Center peek</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="full">Full page</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
