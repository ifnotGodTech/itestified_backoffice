import Link from "next/link";
import type { DonationRow, DonationTab, DonationsViewModel } from "@/features/admin/domain/entities/donations";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildDonationsHref } from "@/features/admin/presentation/state/donations-route-state";

function TopStatPill({
  label,
  tone,
}: {
  label: string;
  tone: "info" | "accent";
}) {
  const cls =
    tone === "accent"
      ? "border-[#cda7f5] bg-[#f3e8ff] text-[#9B68D5]"
      : "border-[#c7ddff] bg-[#eef5ff] text-[#276ef1]";

  return (
    <div className={`inline-flex items-center rounded-full border px-4 py-[10px] text-[14px] font-medium ${cls}`}>
      {label}
    </div>
  );
}

function DonationStatusBadge({ status }: { status: DonationRow["status"] }) {
  const cls =
    status === "successful"
      ? "border-[#0cbc32]/40 bg-transparent text-[#0cbc32]"
      : status === "pending"
        ? "border-[#f0c400]/45 bg-transparent text-[#f0c400]"
        : status === "reversal"
          ? "border-[#8d9aa8]/45 bg-transparent text-[#8d9aa8]"
          : "border-[#ef4335]/45 bg-transparent text-[#ef4335]";
  const label =
    status === "successful" ? "Success" : status === "pending" ? "Pending" : status === "reversal" ? "Reversed" : "Declined";
  return <AdminStatusBadge label={label} toneClassName={cls} />;
}

function PaymentMethodCell({ row }: { row: DonationRow }) {
  const icon =
    row.paymentMethod === "Visa" ? "VISA" : row.paymentMethod === "Mastercard" ? "MC" : "BANK";

  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-[12px] text-white/72">
      <span className="text-[10px] font-semibold text-white/90">{icon}</span>
      <span>{row.paymentMask}</span>
    </span>
  );
}

function DonationActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: DonationRow;
  viewModel: DonationsViewModel;
  onView?: (row: DonationRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;

  return (
    <AdminActionMenuPanel className={`absolute right-0 z-50 min-w-[156px] rounded-[12px] border-[#626262] bg-[#2a2a2a] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <button
        type="button"
        onClick={() => onView?.(row)}
        className="block w-full border-b border-white/10 px-4 py-3 text-left text-[14px] text-white/80 hover:bg-white/[0.04]"
      >
        View details
      </button>
      {row.status === "successful" ? (
        <Link
          href={buildDonationsHref({ tab: viewModel.activeTab, reverse: row.id })}
          className="block border-b border-white/10 px-4 py-3 text-[14px] text-white/80 hover:bg-white/[0.04]"
        >
          Reverse donation
        </Link>
      ) : null}
      {row.status === "successful" ? (
        <Link
          href={buildDonationsHref({ tab: viewModel.activeTab, refund: row.id })}
          className="block border-b border-white/10 px-4 py-3 text-[14px] text-white/35 hover:bg-white/[0.04]"
        >
          Duplicate
        </Link>
      ) : null}
      <Link
        href={buildDonationsHref({ tab: viewModel.activeTab, remove: row.id })}
        className="block px-4 py-3 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
      >
        Delete
      </Link>
    </AdminActionMenuPanel>
  );
}

function HeroCard({ viewModel }: { viewModel: DonationsViewModel }) {
  if (!viewModel.heroCard) return null;

  return (
    <div className="mb-6 rounded-[16px] border border-white/10 bg-[#1c1c1c] px-6 py-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] text-white/55">{viewModel.heroCard.label}</p>
          <p className="mt-4 text-[22px] font-semibold text-white">{viewModel.heroCard.value}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[12px] text-[#ef4335]">{viewModel.heroCard.hint}</span>
            <span className="inline-flex rounded-full bg-[#f8e7e2] px-3 py-[4px] text-[11px] text-[#ef4335]">
              {viewModel.heroCard.trend} ↗
            </span>
          </div>
        </div>
        <div className="relative flex items-center gap-5">
          <Link
            href={buildDonationsHref({ tab: viewModel.activeTab, month: viewModel.selectedMonth, monthMenu: true })}
            aria-haspopup="menu"
            aria-expanded={viewModel.showMonthMenu}
            className="inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-white/[0.07] px-3 text-[14px] text-white/85"
          >
            <span>{viewModel.selectedMonth}</span>
            <span>⌄</span>
          </Link>
          {viewModel.showMonthMenu ? (
            <div className="absolute right-12 top-[38px] z-50 min-w-[132px] overflow-hidden rounded-[12px] border border-white/10 bg-[#242424] shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
              {viewModel.monthOptions.map((month) => (
                <Link
                  key={month}
                  href={buildDonationsHref({ tab: viewModel.activeTab, month })}
                  role="menuitem"
                  className={`block px-4 py-2 text-[14px] hover:bg-white/[0.04] ${month === viewModel.selectedMonth ? "text-[#b27bff]" : "text-white/85"}`}
                >
                  {month}
                </Link>
              ))}
            </div>
          ) : null}
          <button type="button" className="text-white/70" aria-label="Download donations report">
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}

export function DonationsTable({
  viewModel,
  onTabChange,
  onOpenFilter,
  onOpenMenu,
  onCloseMenu,
  onView,
}: {
  viewModel: DonationsViewModel;
  onTabChange?: (tab: DonationTab) => void;
  onOpenFilter?: () => void;
  onOpenMenu?: (row: DonationRow) => void;
  onCloseMenu?: () => void;
  onView?: (row: DonationRow) => void;
}) {
  const showHeaderBadges = viewModel.activeTab !== "all";
  const tableGridClass =
    "grid min-w-[936px] grid-cols-[36px_54px_1fr_1fr_1.1fr_86px_96px_1fr_94px_98px_36px]";

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[1.2] text-[#f4f4f4]">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[15px] text-white/50">{viewModel.pageDescription}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {viewModel.topStats.map((stat) => (
            <TopStatPill key={stat.label} label={stat.label} tone={stat.tone} />
          ))}
        </div>
      </div>

      <div className="mt-8 border-b border-white/10">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {viewModel.tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange?.(tab.key)}
              aria-pressed={tab.key === viewModel.activeTab}
              className={`border-b pb-4 text-[14px] font-semibold ${
                tab.key === viewModel.activeTab ? "border-[#9B68D5] text-[#b27bff]" : "border-transparent text-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-[289px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <AdminSearchIcon />
          </span>
          <input
            readOnly
            value={viewModel.searchQuery}
            placeholder={viewModel.searchPlaceholder}
            className="h-[40px] w-full rounded-[8px] border border-white/5 bg-[#1b1b1b] pl-10 pr-4 text-[12px] text-white/75 outline-none placeholder:text-white/32"
          />
        </div>
        <div className="flex items-center gap-3 self-end">
          <button
            type="button"
            className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-white/15 px-5 text-[14px] text-white/88"
          >
            Export
          </button>
          <button
            type="button"
            onClick={onOpenFilter}
            className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-white/15 px-5 text-[14px] text-white/88"
          >
            Filter
          </button>
        </div>
      </div>

      <HeroCard viewModel={viewModel} />

      <div className="relative mt-7 rounded-[16px] border border-white/10 bg-[#111111] shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[17px] font-semibold text-white">{viewModel.tableTitle}</h2>
          {showHeaderBadges ? (
            <div className="flex flex-wrap items-center gap-3">
              <TopStatPill label={viewModel.tableBadge.donorsLabel} tone="info" />
              <TopStatPill
                label={viewModel.tableBadge.totalLabel}
                tone={viewModel.tableBadge.totalTone === "info" ? "info" : "accent"}
              />
              <span className="text-white/30">⋮</span>
            </div>
          ) : (
            <span className="text-white/30">⋮</span>
          )}
        </div>

        <div className="overflow-x-auto">
          {viewModel.phaseState === "loading" ? <div className="px-8 py-16 text-center text-white/70">Loading donations...</div> : null}
          {viewModel.phaseState === "error" ? <div className="px-8 py-16 text-center text-white/70">{viewModel.errorMessage}</div> : null}
          {viewModel.phaseState === "empty" ? <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">No Donations Yet</div> : null}
          {viewModel.phaseState === "populated" ? (
            <>
              <div className={`${tableGridClass} bg-[#181818] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
                <span>□</span>
                <span>S/N ↕</span>
                <span>Transaction ID</span>
                <span>Name ↕</span>
                <span>Email ↕</span>
                <span>Amount ↕</span>
                <span>Currency ↕</span>
                <span>Payment Method ↕</span>
                <span>Date</span>
                <span>Status ↕</span>
                <span> </span>
              </div>
              {viewModel.rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[18px] text-[11px] text-white/86`}
                >
                  <span>□</span>
                  <span>{viewModel.activeTab === "all" ? row.id : index + 1}</span>
                  <span className="whitespace-nowrap text-white/75">{row.reference}</span>
                  <span>{row.donor}</span>
                  <span className="truncate text-white/72">{row.email}</span>
                  <span>{row.amount}</span>
                  <span>{row.currency}</span>
                  <PaymentMethodCell row={row} />
                  <span>{row.date}</span>
                  <span>
                    <DonationStatusBadge status={row.status} />
                  </span>
                  <div className="relative flex justify-end text-white/70">
                    <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for donation ${row.id}`}>
                      <AdminRowMenuIcon />
                    </button>
                    {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? (
                      <DonationActionMenu row={row} viewModel={viewModel} onView={onView} />
                    ) : null}
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between px-6 py-5 text-[12px] text-white/72">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[10px] border border-white/15 px-5 py-2 text-[14px] text-white/72">
              Previous
            </button>
            <button type="button" className="rounded-[10px] border border-white/15 px-5 py-2 text-[14px] text-white/88">
              Next
            </button>
          </div>
        </div>

        {viewModel.showActionMenu && viewModel.selectedRow ? (
          onCloseMenu ? (
            <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close donations action menu" />
          ) : (
            <AdminActionMenuBackdrop href={buildDonationsHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} label="Close donations action menu" />
          )
        ) : null}
        {viewModel.showMonthMenu ? (
          <AdminActionMenuBackdrop
            href={buildDonationsHref({ tab: viewModel.activeTab, month: viewModel.selectedMonth })}
            label="Close donations month menu"
          />
        ) : null}
      </div>
    </div>
  );
}
