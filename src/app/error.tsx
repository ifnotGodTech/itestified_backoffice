"use client";

import { Button } from "@/core/ui/button";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] p-6 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-lg rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{error.message}</p>
        <div className="mt-4">
          <Button onClick={unstable_retry}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
