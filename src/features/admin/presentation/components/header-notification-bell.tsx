"use client";

import Link from "next/link";
import { useUnreadTestimonyCount } from "@/features/admin/presentation/hooks/use-unread-testimony-count";

function BellIcon({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <path
        d="M10 4.1c1.94 0 3.5 1.56 3.5 3.5v2.02c0 .78.27 1.54.75 2.16l.84 1.02H4.91l.84-1.02c.48-.62.75-1.38.75-2.16V7.6c0-1.94 1.56-3.5 3.5-3.5Z"
        stroke={stroke}
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M8.35 14.6a1.9 1.9 0 0 0 3.3 0" stroke={stroke} strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

export function HeaderNotificationBell() {
  const count = useUnreadTestimonyCount();

  return (
    <Link
      href="/notifications-history?panel=1"
      aria-label="Open notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)]/40 bg-[var(--color-surface-muted)] transition-colors"
    >
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-semibold text-[var(--color-text-primary)]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      <BellIcon stroke="var(--color-text-secondary)" />
    </Link>
  );
}
