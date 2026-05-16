import type { ReactNode } from "react";
import { Card, CardDescription, CardTitle } from "@/core/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="mx-auto w-full max-w-xl border-white/8 bg-[linear-gradient(180deg,rgba(23,23,23,0.98),rgba(10,10,10,0.98))] p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="hidden rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-right sm:block">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Access</p>
          <p className="mt-2 text-sm font-medium text-white">Dashboard workspace</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </Card>
  );
}
