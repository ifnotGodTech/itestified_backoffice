import Link from "next/link";
import type {
  ReferralCommissionRow,
  ReferralCommissionTab,
  ReferralCommissionsViewModel,
} from "@/features/admin/domain/entities/referral-commissions";
import { toDateLabel } from "@/features/admin/data/services/get-referral-commissions-view-model";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildReferralCommissionsHref } from "@/features/admin/presentation/state/referral-commissions-route-state";

function TopStatPill({ label, tone }: { label: string; tone: "info" | "accent" }) {
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

function PaidStatusBadge({ row }: { row: ReferralCommissionRow }) {
  if (row.isPaid) {
    return <AdminStatusBadge label="Paid" toneClassName="border-[#0cbc32]/40 bg-transparent text-[#0cbc32]" />;
  }
  return <AdminStatusBadge label="Unpaid" toneClassName="border-[#f0c400]/45 bg-transparent text-[#f0c400]" />;
}

function formatAmount(row: ReferralCommissionRow) {
  return `${row.currency} ${(row.amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function CommissionActionMenu({
  row,
  viewModel,
}: {
  row: ReferralCommissionRow;
  viewModel: ReferralCommissionsViewModel;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;

  return (
    <AdminActionMenuPanel
      className={`absolute right-0 z-50 min-w-[170px] rounded-[12px] border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}
    >
      <Link
        href={buildReferralCommissionsHref({ tab: viewModel.activeTab, markPaid: row.id })}
        className="block px-4 py-3 text-[14px] text-[#0cbc32] hover:bg-white/[0.04]"
      >
        Mark as paid
      </Link>
    </AdminActionMenuPanel>
  );
}

function paginationHref(viewModel: ReferralCommissionsViewModel, page: number) {
  return buildReferralCommissionsHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery,
    page,
  });
}

export function ReferralCommissionsTable({
  viewModel,
  onTabChange,
  onOpenMenu,
  onCloseMenu,
}: {
  viewModel: ReferralCommissionsViewModel;
  onTabChange?: (tab: ReferralCommissionTab) => void;
  onOpenMenu?: (row: ReferralCommissionRow) => void;
  onCloseMenu?: () => void;
}) {
  const tableGridClass = "grid min-w-[920px] grid-cols-[1.3fr_1.3fr_1fr_90px_130px_120px_1.1fr_36px]";

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{viewModel.pageTitle}</h1>
          <p className="mt-2 max-w-[56ch] text-[15px] text-white/50">{viewModel.pageDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            className="h-[40px] w-full rounded-[8px] border border-white/5 bg-[var(--color-surface-elevated)] pl-10 pr-4 text-[12px] text-white/75 outline-none placeholder:text-white/32"
          />
        </div>
      </div>

      <div className="relative mt-7 rounded-[16px] border border-white/10 bg-[var(--color-surface-elevated)] shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[17px] font-semibold text-white">{viewModel.tableTitle}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <TopStatPill label={viewModel.tableBadge.totalLabel} tone="info" />
            <span className="text-white/30">⋮</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewModel.phaseState === "loading" ? (
            <div className="px-8 py-16 text-center text-white/70">Loading commission ledger...</div>
          ) : null}
          {viewModel.phaseState === "error" ? (
            <AdminErrorState title="Unable to load the commission ledger" message={viewModel.errorMessage} />
          ) : null}
          {viewModel.phaseState === "empty" ? (
            <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">
              {viewModel.activeTab === "unpaid" ? "No unpaid commissions right now" : "No commissions found"}
            </div>
          ) : null}
          {viewModel.phaseState === "populated" ? (
            <>
              <div className={`${tableGridClass} bg-[var(--color-surface-elevated)] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
                <span>Referrer</span>
                <span>Referred subscriber</span>
                <span>Amount</span>
                <span>Rate</span>
                <span>Billing period</span>
                <span>Status</span>
                <span>Paid by</span>
                <span> </span>
              </div>
              {viewModel.rows.map((row) => (
                <div
                  key={row.id}
                  className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[16px] text-[12px] text-white/86`}
                >
                  <span className="truncate font-medium">{row.referrerEmail}</span>
                  <span className="truncate text-white/72">{row.referredUserEmail}</span>
                  <span className="font-medium text-white">{formatAmount(row)}</span>
                  <span className="text-white/60">{row.ratePercent}%</span>
                  <span className="text-white/60">{toDateLabel(row.billingPeriodEnd)}</span>
                  <span>
                    <PaidStatusBadge row={row} />
                  </span>
                  <span className="truncate text-white/60">{row.paidByEmail ?? "—"}</span>
                  <div className="relative flex justify-end text-white/70">
                    {!row.isPaid ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpenMenu?.(row)}
                          aria-label={`Open actions for commission from ${row.referrerEmail}`}
                        >
                          <AdminRowMenuIcon />
                        </button>
                        {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? (
                          <CommissionActionMenu row={row} viewModel={viewModel} />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>

        <AdminPaginationFooter
          showingLabel={viewModel.showingLabel}
          hasPreviousPage={viewModel.hasPreviousPage}
          hasNextPage={viewModel.hasNextPage}
          previousHref={paginationHref(viewModel, viewModel.page - 1)}
          nextHref={paginationHref(viewModel, viewModel.page + 1)}
        />

        {viewModel.showActionMenu && viewModel.selectedRow ? (
          onCloseMenu ? (
            <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close commission action menu" />
          ) : (
            <AdminActionMenuBackdrop
              href={buildReferralCommissionsHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
              label="Close commission action menu"
            />
          )
        ) : null}
      </div>
    </div>
  );
}
