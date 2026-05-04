"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/shared/ui/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button type="button" variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <span suppressHydrationWarning aria-hidden="true">
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </Button>
  );
}
