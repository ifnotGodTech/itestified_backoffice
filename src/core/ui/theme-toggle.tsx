"use client";

import { useTheme } from "next-themes";
import { Button } from "@/core/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") === "dark";

  return (
    <Button variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? "Light view" : "Dark view"}
    </Button>
  );
}
