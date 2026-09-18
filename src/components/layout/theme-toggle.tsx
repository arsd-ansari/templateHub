"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <Button aria-label="Toggle theme" size="icon" variant="ghost" onClick={toggleTheme} title="Toggle theme">
      <Icon size={18} />
    </Button>
  );
}
