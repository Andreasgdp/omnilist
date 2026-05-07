"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShellClient({
  sidebar,
  collapsedSidebar,
  children,
}: {
  sidebar: React.ReactNode;
  collapsedSidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background lg:grid lg:h-screen lg:grid-cols-[auto_minmax(0,1fr)]">
      <aside
        className={cn(
          "hidden h-screen overflow-hidden border-r border-border/60 bg-card/55 backdrop-blur-xl transition-all duration-200 lg:flex lg:flex-col",
          collapsed ? "lg:w-[76px]" : "lg:w-[280px]",
        )}
      >
        <div className={cn("flex px-3 py-3", collapsed ? "justify-center" : "justify-end")}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{collapsed ? collapsedSidebar : sidebar}</div>
      </aside>

      <div className="min-w-0 overflow-x-hidden lg:h-screen lg:overflow-y-auto">{children}</div>
    </div>
  );
}
