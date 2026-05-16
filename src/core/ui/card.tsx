import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/core/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_24px_80px_-56px_rgba(0,0,0,0.8)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">{children}</p>;
}
