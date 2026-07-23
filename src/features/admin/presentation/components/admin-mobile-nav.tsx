"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminNavItem } from "@/features/admin/domain/entities/shell";
import { AdminSidebarNav } from "@/features/admin/presentation/components/admin-sidebar-nav";
import { AdminThemeToggle } from "@/features/admin/presentation/components/admin-theme-toggle";

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="var(--color-text-secondary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5 5 15" stroke="var(--color-text-secondary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AdminMobileNav({
  sidebarItems,
  settingsItems,
}: {
  sidebarItems: AdminNavItem[];
  settingsItems: AdminNavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)]/40 bg-[var(--color-surface-muted)] md:hidden"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 flex w-[260px] max-w-[80vw] flex-col overflow-y-auto border-r border-[var(--color-border-subtle)]/30 bg-[var(--color-surface-elevated)] pb-6">
            <div className="flex items-center justify-between px-3 pb-4 pt-3">
              <Image src="/admin-logo.svg" alt="iTestified" width={130} height={44} className="h-[44px] w-[130px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)]/40 bg-[var(--color-surface-muted)]"
              >
                <CloseIcon />
              </button>
            </div>
            <AdminSidebarNav sidebarItems={sidebarItems} settingsItems={settingsItems} />
            <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border-subtle)]/30 px-4 pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)]">Appearance</span>
              <AdminThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
