import Link from "next/link";
import type { NotificationsHistoryViewModel } from "@/features/admin/domain/entities/notifications-history";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { NotificationsHistoryOverlays } from "@/features/admin/presentation/components/notifications-history/notifications-history-overlays";
import { NotificationsHistoryTable } from "@/features/admin/presentation/components/notifications-history/notifications-history-table";
import { buildNotificationsHistoryHref } from "@/features/admin/presentation/state/notifications-history-route-state";

function NotificationPanel({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  return (
    <div className="relative max-w-[1248px] pt-6 md:pt-8">
      <div className="min-h-[648px] rounded-[20px] bg-[#161616] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h1 className="text-[16px] font-normal text-white">Notifications</h1>
        <div className="flex min-h-[520px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-[108px] w-[108px] rotate-[-16deg] items-center justify-center rounded-[10px] border border-white/10 bg-[#222222] shadow-[0_18px_32px_rgba(0,0,0,0.35)]">
              <svg viewBox="0 0 64 64" className="h-[54px] w-[54px] text-white/25" fill="none" aria-hidden="true">
                <path d="M32 16c7.18 0 13 5.82 13 13v9.11c0 2.62.9 5.16 2.54 7.2L50 48H14l2.46-2.69A10.92 10.92 0 0 0 19 38.11V29c0-7.18 5.82-13 13-13Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                <path d="M26 52a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[28px] font-semibold text-white">No Data</p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-[10px] w-full max-w-[422px] rounded-[18px] border border-white/12 bg-[#181818] shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
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

export function NotificationsHistoryPage({ viewModel }: { viewModel: NotificationsHistoryViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      {viewModel.showPanel ? <NotificationPanel viewModel={viewModel} /> : <NotificationsHistoryTable viewModel={viewModel} />}
      <NotificationsHistoryOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
