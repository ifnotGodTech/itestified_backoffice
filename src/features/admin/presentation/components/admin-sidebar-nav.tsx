"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AdminNavItem } from "@/features/admin/domain/entities/shell";
import { AdminSidebarLogoutButton } from "@/features/admin/presentation/components/admin-sidebar-logout-button";

function SidebarIcon({ kind, active = false }: { kind: string; active?: boolean }) {
  const color = active ? "var(--color-text-primary)" : "var(--color-text-secondary)";
  const cls = "h-[18px] w-[18px]";

  if (kind === "grid") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <rect x="2" y="2" width="6" height="6" rx="1" fill={color} />
        <rect x="12" y="2" width="6" height="6" rx="1" fill={color} />
        <rect x="2" y="12" width="6" height="6" rx="1" fill={color} />
        <rect x="12" y="12" width="6" height="6" rx="1" fill={color} />
      </svg>
    );
  }

  if (kind === "home") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M3 9.5L10 4l7 5.5V17h-4.5v-4H7.5v4H3V9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "book") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M5 3h10v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke={color} strokeWidth="1.8" />
        <path d="M7 6h6M7 10h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "users") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth="1.8" />
        <circle cx="14" cy="8" r="2" stroke={color} strokeWidth="1.8" />
        <path d="M2.5 16c.7-2.5 2.8-3.8 5.2-3.8S12.2 13.5 13 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 15.5c.4-1.8 1.8-2.8 3.6-2.8 1 0 1.6.2 2 .5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "chat") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M3 4.5h14v9H8l-4 3v-3H3v-9z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "image") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <rect x="2.5" y="3.5" width="15" height="13" rx="1.5" stroke={color} strokeWidth="1.8" />
        <circle cx="7" cy="8" r="1.5" fill={color} />
        <path d="M5 14l3.2-3.2 2.5 2.5 2.3-2.3L15 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "money") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke={color} strokeWidth="1.8" />
        <circle cx="10" cy="10" r="2.2" stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "bell") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M10 4.2a3.3 3.3 0 0 1 3.3 3.3v2.1c0 .8.3 1.6.8 2.2l.7.8H5.2l.7-.8c.5-.6.8-1.4.8-2.2V7.5A3.3 3.3 0 0 1 10 4.2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.3 14.8a1.9 1.9 0 0 0 3.4 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "star") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M10 3.2l2.1 4.2 4.6.7-3.3 3.2.8 4.6-4.2-2.2-4.1 2.2.8-4.6-3.4-3.2 4.7-.7L10 3.2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "chart") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <path d="M4 16V9M10 16V5M16 16V11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "profile") {
    return (
      <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="2.5" stroke={color} strokeWidth="1.8" />
        <path d="M4.5 16c.8-2.4 2.8-3.7 5.5-3.7s4.7 1.3 5.5 3.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className={cls} fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.4" stroke={color} strokeWidth="1.8" />
      <path d="M10 3.5v2M10 14.5v2M16.5 10h-2M5.5 10h-2M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4M14.8 14.8l-1.4-1.4M6.6 6.6 5.2 5.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AdminSidebarNav({
  sidebarItems,
  settingsItems,
}: {
  sidebarItems: AdminNavItem[];
  settingsItems: AdminNavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        sidebarItems
          .filter((item) => item.expanded || (item.active && item.children?.length))
          .map((item) => [item.href, true]),
      ),
  );

  function hrefMatchesCurrentRoute(href: string) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (pathname !== hrefPath) return false;
    if (!hrefQuery) return true;

    const expectedParams = new URLSearchParams(hrefQuery);
    for (const [key, value] of expectedParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  function itemMatchesCurrentRoute(item: AdminNavItem) {
    return hrefMatchesCurrentRoute(item.href) || Boolean(item.children?.some((child) => hrefMatchesCurrentRoute(child.href)));
  }

  return (
    <>
      <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)]">Main Menu</div>
      <nav className="mt-3 space-y-1 px-0">
        {sidebarItems.map((item) => {
          const isActive = itemMatchesCurrentRoute(item);
          const isExpanded = item.children?.length ? expandedItems[item.href] ?? isActive : false;

          return (
            <div key={item.label}>
              {item.hasCaret ? (
                <button
                  type="button"
                  onClick={() => {
                    if (pathname === item.href) {
                      setExpandedItems((current) => ({ ...current, [item.href]: !isExpanded }));
                      return;
                    }

                    setExpandedItems((current) => ({ ...current, [item.href]: true }));
                    router.push(item.href);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-[13px] text-left text-[14px] transition ${
                    isActive
                      ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                  aria-expanded={isExpanded}
                >
                  <span className="flex items-center gap-3">
                    <SidebarIcon kind={item.icon} active={isActive || isExpanded} />
                    <span>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {item.badge ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] text-[var(--color-text-primary)]">
                        {item.badge}
                      </span>
                    ) : null}
                    <span
                      className={`text-[11px] transition-transform ${
                        isActive || isExpanded ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                      } ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-[13px] text-[14px] transition ${
                    isActive
                      ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <SidebarIcon kind={item.icon} active={isActive} />
                    <span>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {item.badge ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] text-[var(--color-text-primary)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </Link>
              )}

              {isExpanded && item.children?.length ? (
                <div className="space-y-1 bg-[var(--color-surface-panel)] py-2">
                  {item.children.map((child) => {
                    const childActive = hrefMatchesCurrentRoute(child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-[9px] text-[14px] transition ${
                          childActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-muted)]">Settings</div>
      <div className="mt-3 space-y-1">
        {settingsItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-[13px] text-[14px] transition ${
              hrefMatchesCurrentRoute(item.href)
                ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <SidebarIcon kind={item.icon} active={hrefMatchesCurrentRoute(item.href)} />
            <span>{item.label}</span>
          </Link>
        ))}
        <AdminSidebarLogoutButton />
      </div>
    </>
  );
}
