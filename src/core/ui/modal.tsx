"use client";

import type { ReactNode } from "react";
import { Button } from "@/core/ui/button";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-lg rounded-[28px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.85)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">{children}</div>
      </div>
    </div>
  );
}
