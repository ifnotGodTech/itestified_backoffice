"use client";

import type { HomeManagementSectionKey, HomeManagementSectionOrderItem } from "@/features/admin/domain/entities/home-management";

export function HomeManagementSectionOrderCard({
  sectionOrder,
  onMove,
  disabled,
}: {
  sectionOrder: HomeManagementSectionOrderItem[];
  onMove: (key: HomeManagementSectionKey, direction: "up" | "down") => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[18px] bg-[var(--color-surface-elevated)] px-4 py-4">
      <p className="mb-3 text-[16px] font-medium text-white/90">Home Screen Section Order</p>
      <div className="space-y-2">
        {sectionOrder.map((section, index) => (
          <div key={section.key} className="flex items-center justify-between rounded-[10px] bg-[var(--color-surface-muted)] px-4 py-3">
            <span className="text-[14px] text-white/85">
              {index + 1}. {section.label}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => onMove(section.key, "up")}
                aria-label={`Move ${section.label} up`}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/15 text-white/80 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={disabled || index === sectionOrder.length - 1}
                onClick={() => onMove(section.key, "down")}
                aria-label={`Move ${section.label} down`}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/15 text-white/80 disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
