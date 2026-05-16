import Link from "next/link";
import type { NotificationHistoryRow, NotificationsHistoryViewModel } from "@/features/admin/domain/entities/notifications-history";
import { buildNotificationsHistoryHref } from "@/features/admin/presentation/state/notifications-history-route-state";

function selectionHref(viewModel: NotificationsHistoryViewModel, id: number) {
  const current = new Set(viewModel.selectedIds);
  if (current.has(id)) current.delete(id);
  else current.add(id);

  return buildNotificationsHistoryHref({
    q: viewModel.searchQuery,
    panel: viewModel.showPanel ? true : null,
    statusFilter: viewModel.filterDraft.status,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    read: viewModel.rows.filter((row) => row.status === "read").map((row) => row.id).join(",") || null,
    selected: Array.from(current).sort((a, b) => a - b).join(",") || null,
  });
}

function selectAllHref(viewModel: NotificationsHistoryViewModel) {
  const nextSelected =
    viewModel.selectedIds.length === viewModel.rows.length
      ? null
      : viewModel.rows.map((row) => row.id).join(",");

  return buildNotificationsHistoryHref({
    q: viewModel.searchQuery,
    panel: viewModel.showPanel ? true : null,
    statusFilter: viewModel.filterDraft.status,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    read: viewModel.rows.filter((row) => row.status === "read").map((row) => row.id).join(",") || null,
    selected: nextSelected,
  });
}

function NotificationCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-[12px] w-[12px] items-center justify-center rounded-[2px] border ${
        checked ? "border-[#9B68D5] bg-[#9B68D5]" : "border-white/35 bg-transparent"
      }`}
      aria-hidden="true"
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]" fill="none">
          <path d="M2.3 6.1 4.9 8.6 9.6 3.7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function NotificationDot({ status }: { status: NotificationHistoryRow["status"] }) {
  return <span className={`inline-flex h-[12px] w-[12px] rounded-full border ${status === "unread" ? "border-[#9B68D5] bg-[#9B68D5]" : "border-[#9B68D5] bg-transparent"}`} />;
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" fill="none" aria-hidden="true">
      <path d="M3 4h10M5 8h6M6.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationsHistoryTable({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  const hasSelection = viewModel.selectedIds.length > 0;
  const readIds = viewModel.rows.filter((row) => row.status === "read").map((row) => row.id).join(",") || null;
  const selectionCopy =
    viewModel.selectedIds.length > 1
      ? { deleteLabel: "Delete All", readLabel: "Mark All as read" }
      : { deleteLabel: "Delete", readLabel: "Mark as read" };

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="rounded-[20px] bg-[#1b1b1b] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between px-[14px] py-[12px]">
          <h1 className="text-[16px] font-normal text-white">Notifications</h1>
          <div className="flex items-center gap-3">
            {hasSelection ? (
              <>
                <Link href={buildNotificationsHistoryHref({ selected: viewModel.selectedIds.join(","), deleteAll: true })} className="inline-flex h-[28px] items-center rounded-[8px] bg-[#ef3931] px-4 text-[12px] text-white">
                  {selectionCopy.deleteLabel}
                </Link>
                <Link
                  href={buildNotificationsHistoryHref({
                    panel: viewModel.showPanel ? true : null,
                    q: viewModel.searchQuery || null,
                    statusFilter: viewModel.filterDraft.status,
                    from: viewModel.filterDraft.from,
                    to: viewModel.filterDraft.to,
                    read: viewModel.selectedIds.length > 0 ? "selected" : null,
                    selected: viewModel.selectedIds.join(",") || null,
                    success: "read",
                  })}
                  className="inline-flex h-[28px] items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] text-[#b27bff]"
                >
                  {selectionCopy.readLabel}
                </Link>
              </>
            ) : null}
            <Link href={buildNotificationsHistoryHref({ filter: true, panel: viewModel.showPanel ? true : null, statusFilter: viewModel.filterDraft.status, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, read: readIds, selected: viewModel.selectedIds.join(",") || null })} className="inline-flex h-[28px] items-center gap-2 rounded-[8px] border border-[#9B68D5] px-3 text-[12px] text-[#b27bff]">
              <FilterIcon />
              Filter
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[32px_1fr_20px] items-center bg-[#262626] px-[10px] py-[8px] text-[10px] text-white/90">
          <Link href={selectAllHref(viewModel)} aria-label="Select all notifications" className="inline-flex items-center justify-center">
            <NotificationCheckbox checked={viewModel.selectedIds.length === viewModel.rows.length && viewModel.rows.length > 0} />
          </Link>
          <span>All Notifications ↕</span>
          <span />
        </div>

        {viewModel.phaseState === "loading" ? <div className="px-8 py-16 text-center text-white/70">Loading notifications...</div> : null}
        {viewModel.phaseState === "error" ? <div className="px-8 py-16 text-center text-white/70">{viewModel.errorMessage}</div> : null}
        {viewModel.phaseState === "empty" ? <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">No Notifications Yet</div> : null}

        {viewModel.phaseState === "populated"
          ? viewModel.rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[32px_1fr_20px] gap-[10px] border-t border-white/10 px-[10px] py-[14px]">
                <Link href={selectionHref(viewModel, row.id)} aria-label={`Select notification ${row.id}`} className="inline-flex items-start justify-center pt-1">
                  <NotificationCheckbox checked={viewModel.selectedIds.includes(row.id)} />
                </Link>
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {row.href ? (
                      <Link href={row.href} className={`text-[14px] font-semibold leading-[1.25] ${row.status === "unread" || viewModel.selectedIds.includes(row.id) ? "text-[#9B68D5]" : "text-white"}`}>
                        {row.title}
                      </Link>
                    ) : (
                      <p className={`text-[14px] font-semibold leading-[1.25] ${row.status === "unread" || viewModel.selectedIds.includes(row.id) ? "text-[#9B68D5]" : "text-white"}`}>{row.title}</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-white/52">
                      <span>{row.date}</span>
                      <span>•</span>
                      <span>{row.time}</span>
                    </div>
                  </div>
                  <p className="mt-[6px] text-[14px] leading-[1.35] text-white/62">{row.message}</p>
                </div>
                <div className="flex items-start justify-end pt-[2px]">
                  <Link href={buildNotificationsHistoryHref({ panel: viewModel.showPanel ? true : null, q: viewModel.searchQuery || null, statusFilter: viewModel.filterDraft.status, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, read: readIds, delete: row.id, selected: viewModel.selectedIds.join(",") || null })} aria-label={`Delete notification ${row.id}`}>
                    <NotificationDot status={row.status} />
                  </Link>
                </div>
              </div>
            ))
          : null}

        <div className="flex items-center justify-between px-[10px] py-7 text-[10px] text-white/62">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/15 px-4 py-[6px] text-[12px] text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[#9B68D5] px-4 py-[6px] text-[12px] text-[#b27bff]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
