"use client";

import Link from "next/link";
import { useState } from "react";
import type { NotificationsHistoryViewModel } from "@/features/admin/domain/entities/notifications-history";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { NotificationsHistoryOverlays } from "@/features/admin/presentation/components/notifications-history/notifications-history-overlays";
import { NotificationsHistoryTable } from "@/features/admin/presentation/components/notifications-history/notifications-history-table";
import { buildNotificationsHistoryHref } from "@/features/admin/presentation/state/notifications-history-route-state";

function NotificationPanel({
  viewModel,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onOpenFilter,
}: {
  viewModel: NotificationsHistoryViewModel;
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onToggleAll: () => void;
  onOpenFilter: () => void;
}) {
  return (
    <div className="relative max-w-[1248px] pt-6 md:pt-8">
      <NotificationsHistoryTable
        viewModel={viewModel}
        selectedIds={selectedIds}
        onToggleSelection={onToggleSelection}
        onToggleAll={onToggleAll}
        onOpenFilter={onOpenFilter}
      />

      <div className="absolute right-0 top-[10px] w-full max-w-[422px] rounded-[18px] border border-white/12 bg-[var(--color-surface-elevated)] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between border-b border-white/10 px-[18px] py-[14px]">
          <h2 className="text-[22px] font-semibold text-white">Notifications</h2>
          <Link href={buildNotificationsHistoryHref({})} aria-label="Close notifications panel" className="text-[30px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="border-b border-white/10 px-[18px] py-[10px] text-right">
          <button type="button" className="inline-flex h-[28px] items-center rounded-[8px] border border-[#9B68D5] px-3 text-[12px] text-[#b27bff]">
            Settings
          </button>
        </div>
        <div>
          {viewModel.rows.slice(0, 3).map((row) => (
            <div key={row.id} className="border-b border-white/10 px-[18px] py-[12px]">
              {row.href ? (
                <Link href={row.href} className={`block text-[13px] font-semibold ${row.status === "unread" ? "text-[#9B68D5]" : "text-white"}`}>
                  {row.title}
                </Link>
              ) : (
                <p className={`text-[13px] font-semibold ${row.status === "unread" ? "text-[#9B68D5]" : "text-white"}`}>{row.title}</p>
              )}
              <p className="mt-[6px] max-w-[335px] text-[12px] leading-[1.35] text-white/58">{row.message}</p>
              <div className="mt-[10px] flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-white/48">
                  <span>{row.date}</span>
                  <span>{row.time}</span>
                </div>
                <span className={`inline-flex h-[12px] w-[12px] rounded-full border border-[#9B68D5] ${row.status === "unread" ? "bg-[#9B68D5]" : "bg-transparent"}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-[18px] py-[14px]">
          <Link href={buildNotificationsHistoryHref({ panel: true, read: "all", success: "read" })} className="text-[12px] font-medium text-[#9B68D5]">
            Mark All as Read
          </Link>
          <Link href={buildNotificationsHistoryHref({})} className="inline-flex h-[28px] items-center rounded-[8px] border border-[#9B68D5] px-3 text-[12px] text-[#b27bff]">
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}

function notificationsHistoryResetKey(viewModel: NotificationsHistoryViewModel) {
  return [
    viewModel.phaseState,
    viewModel.searchQuery,
    viewModel.selectedIds.join(","),
    viewModel.rows.map((row) => `${row.id}:${row.status}`).join(","),
    viewModel.selectedRow?.id ?? "",
    viewModel.filterDraft.status ?? "",
    viewModel.filterDraft.from ?? "",
    viewModel.filterDraft.to ?? "",
    viewModel.showPanel ? "panel" : "",
    viewModel.showFilterModal ? "filter" : "",
    viewModel.showDeleteModal ? "delete" : "",
    viewModel.deleteMode ?? "",
    viewModel.showSuccess ? "success" : "",
  ].join("|");
}

export function NotificationsHistoryPage({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  return <NotificationsHistoryPageContent key={notificationsHistoryResetKey(viewModel)} viewModel={viewModel} />;
}

function NotificationsHistoryPageContent({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  const [selectedIds, setSelectedIds] = useState(viewModel.selectedIds);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const interactiveViewModel: NotificationsHistoryViewModel = {
    ...viewModel,
    selectedIds,
    showFilterModal: showFilterModal || viewModel.showFilterModal,
  };

  function toggleSelection(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return Array.from(next).sort((a, b) => a - b);
    });
  }

  function toggleAll() {
    setSelectedIds((current) => (current.length === viewModel.rows.length ? [] : viewModel.rows.map((row) => row.id)));
  }

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      {interactiveViewModel.showPanel ? (
        <NotificationPanel
          viewModel={interactiveViewModel}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleAll={toggleAll}
          onOpenFilter={() => setShowFilterModal(true)}
        />
      ) : (
        <NotificationsHistoryTable
          viewModel={interactiveViewModel}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleAll={toggleAll}
          onOpenFilter={() => setShowFilterModal(true)}
        />
      )}
      <NotificationsHistoryOverlays viewModel={interactiveViewModel} showFilterModal={showFilterModal} onCloseFilter={() => setShowFilterModal(false)} />
    </AdminDashboardShell>
  );
}
