"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/core/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
