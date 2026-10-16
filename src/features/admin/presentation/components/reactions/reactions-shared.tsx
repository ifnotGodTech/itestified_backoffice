"use client";

import type { ReactNode } from "react";

// Theme tokens throughout, so the page reads right in light and dark mode.
export const CARD = "rounded-[14px] bg-[var(--color-surface-elevated)] shadow-[0_0_0_1px_var(--color-border-subtle)]";

export const PRIMARY_BUTTON =
  "inline-flex min-h-[40px] items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-4 text-[13.5px] font-semibold text-[#ffffff] disabled:cursor-not-allowed disabled:opacity-50";

export const SECONDARY_BUTTON =
  "inline-flex min-h-[40px] items-center justify-center rounded-[8px] px-4 text-[13.5px] text-[var(--color-text-secondary)] shadow-[0_0_0_1px_var(--color-border-soft)] hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50";

export function IconTile({ emoji, size = "md" }: { emoji: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-surface-muted)] ${
        size === "sm" ? "h-8 w-8 text-[16px]" : "h-9 w-9 text-[18px]"
      }`}
    >
      {emoji}
    </span>
  );
}

export function Dialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-16">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex w-full max-w-[520px] flex-col gap-5 px-6 py-6 ${CARD}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-bold text-[var(--color-text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-[8px] text-[18px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
          >
            ✕
          </button>
        </div>
        {children}
        <div className="flex flex-wrap justify-end gap-2.5">{footer}</div>
      </section>
    </div>
  );
}

/** One response button as the app draws it in the responses sheet. */
export function AppReactionRow({ emoji, label, count, mine }: { emoji: string; label: string; count: string; mine?: boolean }) {
  return (
    <div
      className={`flex min-h-[44px] items-center gap-2.5 rounded-[12px] px-3 py-2 ${
        mine ? "bg-[#9966CC] text-[#ffffff]" : "bg-[#F3EEF8] text-[#1F1A27]"
      }`}
    >
      <span aria-hidden="true" className="text-[16px]">
        {emoji}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{label}</span>
      <span className="text-[12px] font-semibold">{count}</span>
    </div>
  );
}
