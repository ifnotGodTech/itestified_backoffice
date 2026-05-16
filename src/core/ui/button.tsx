import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/core/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantMap: Record<Variant, string> = {
  primary:
    "border border-transparent bg-[var(--color-primary)] text-white shadow-[0_18px_40px_-24px_rgba(153,102,204,0.9)] hover:bg-[var(--color-primary-strong)]",
  secondary:
    "border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] text-[var(--color-text-primary)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-surface-muted)]",
  ghost:
    "border border-white/10 bg-white/[0.03] text-[var(--color-text-secondary)] hover:bg-white/[0.08] hover:text-[var(--color-text-primary)]",
  danger: "border border-transparent bg-[var(--color-danger)] text-white hover:brightness-110",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:cursor-not-allowed disabled:opacity-60",
        variantMap[variant],
        className,
      )}
      {...props}
    />
  );
}
