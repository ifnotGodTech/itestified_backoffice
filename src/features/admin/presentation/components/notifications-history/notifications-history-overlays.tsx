import Link from "next/link";
import type { NotificationsHistoryViewModel } from "@/features/admin/domain/entities/notifications-history";
import { buildNotificationsHistoryHref } from "@/features/admin/presentation/state/notifications-history-route-state";

function closeHref(viewModel: NotificationsHistoryViewModel) {
  const readIds = viewModel.rows.filter((row) => row.status === "read").map((row) => row.id).join(",") || null;
  return buildNotificationsHistoryHref({
    q: viewModel.searchQuery,
    panel: viewModel.showPanel ? true : null,
    statusFilter: viewModel.filterDraft.status,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    read: readIds,
    selected: viewModel.selectedIds.join(",") || null,
  });
}

export function NotificationsHistoryOverlays({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  const readIds = viewModel.rows.filter((row) => row.status === "read").map((row) => row.id).join(",") || null;
  return (
    <>
      {viewModel.showFilterModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 px-6 py-24">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close notifications filter modal" />
          <form action="/notifications-history" className="relative z-10 w-full max-w-[324px] overflow-hidden rounded-[18px] border border-white/15 bg-[#1d1d1d] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <input type="hidden" name="selected" value={viewModel.selectedIds.join(",")} />
            {viewModel.showPanel ? <input type="hidden" name="panel" value="1" /> : null}
            <div className="border-b border-white/10 px-3 py-3">
              <h2 className="text-[14px] font-normal text-white">Filter</h2>
            </div>
            <div className="px-3 py-3">
              <div className="border-b border-white/10 pb-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] text-white">Status</p>
                  <Link href={buildNotificationsHistoryHref({ filter: true, panel: viewModel.showPanel ? true : null, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, read: readIds, selected: viewModel.selectedIds.join(",") || null })} className="text-[12px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="flex gap-5 text-[12px] text-white/85">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="statusFilter" value="read" defaultChecked={viewModel.filterDraft.status === "read"} className="h-[13px] w-[13px] accent-[#9B68D5]" />Read</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="statusFilter" value="unread" defaultChecked={viewModel.filterDraft.status === "unread"} className="h-[13px] w-[13px] accent-[#9B68D5]" />Unread</label>
                </div>
              </div>
              <div className="pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] text-white">Date Range</p>
                  <Link href={buildNotificationsHistoryHref({ filter: true, panel: viewModel.showPanel ? true : null, statusFilter: viewModel.filterDraft.status, read: readIds, selected: viewModel.selectedIds.join(",") || null })} className="text-[12px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-[10px] text-white/55">From</p>
                    <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="h-[26px] w-full rounded-[6px] bg-[#2a2a2a] px-3 text-[10px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] text-white/55">To</p>
                    <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="h-[26px] w-full rounded-[6px] bg-[#2a2a2a] px-3 text-[10px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-3 pb-3 pt-1">
              <Link href={buildNotificationsHistoryHref({ filter: true, panel: viewModel.showPanel ? true : null, read: readIds, selected: viewModel.selectedIds.join(",") || null })} className="inline-flex h-[28px] items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#b27bff]">Clear All</Link>
              <button type="submit" className="inline-flex h-[28px] items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] text-white">Apply</button>
            </div>
          </form>
        </div>
      ) : null}

      {viewModel.showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete notification modal" />
          <div className="relative z-10 w-full max-w-[434px] rounded-[20px] bg-[#1f1f1f] px-9 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Link href={closeHref(viewModel)} className="absolute right-5 top-3 text-[28px] leading-none text-white/90" aria-label="Close delete notification modal">×</Link>
            <h2 className="text-[16px] font-semibold text-white">{viewModel.deleteMode === "bulk" ? "Delete Notification" : "Delete Notification"}</h2>
            <p className="mx-auto mt-5 max-w-[330px] text-[14px] leading-[1.45] text-white/78">
              {viewModel.deleteMode === "bulk"
                ? "Are you sure you want to delete all notifications? This action cannot be undone, and all notifications will be permanently removed."
                : "Are you sure you want to delete this notification? This action cannot be undone."}
            </p>
            <div className="mt-14 flex justify-center gap-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-[8px] border border-[#9B68D5] px-6 text-[12px] text-[#9B68D5]">Cancel</Link>
              <Link href={buildNotificationsHistoryHref({ panel: viewModel.showPanel ? true : null, read: readIds, success: "delete" })} className="inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-[8px] bg-[#ef3931] px-6 text-[12px] text-white">Delete</Link>
            </div>
          </div>
        </div>
      ) : null}

      {viewModel.showSuccess && viewModel.successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close notifications success modal" />
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[#1f1f1f] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">{viewModel.successMessage}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
