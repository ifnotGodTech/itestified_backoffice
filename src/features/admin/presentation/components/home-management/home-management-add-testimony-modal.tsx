"use client";

import type { HomeManagementAvailableTestimony, HomeManagementTab } from "@/features/admin/domain/entities/home-management";

export function HomeManagementAddTestimonyModal({
  activeTab,
  availableTestimonies,
  onAdd,
  onClose,
  pendingId,
}: {
  activeTab: HomeManagementTab;
  availableTestimonies: HomeManagementAvailableTestimony[];
  onAdd: (id: number) => void;
  onClose: () => void;
  pendingId?: number | null;
}) {
  const testimonyType = activeTab === "text" ? "text" : "video";
  const candidates = availableTestimonies.filter((item) => item.testimonyType === testimonyType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close add testimony modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[22px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--color-surface-elevated)] px-6 py-5">
          <h2 className="text-[22px] font-semibold text-white">Add to Featured Testimonies</h2>
          <button type="button" onClick={onClose} className="text-[30px] leading-none text-white/90" aria-label="Close add testimony modal">
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-white/60">No approved {testimonyType} testimonies available to feature right now.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {candidates.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-[14px] font-medium text-white/90">{item.title}</p>
                    <p className="text-[12px] text-white/50">{item.category}</p>
                  </div>
                  <button
                    type="button"
                    disabled={pendingId === item.id}
                    onClick={() => onAdd(item.id)}
                    className="rounded-[8px] bg-[#9B68D5] px-4 py-2 text-[13px] text-white disabled:opacity-50"
                  >
                    {pendingId === item.id ? "Adding..." : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
