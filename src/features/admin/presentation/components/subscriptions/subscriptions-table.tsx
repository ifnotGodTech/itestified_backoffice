import Link from "next/link";
import type { SubscriptionRow, SubscriptionTab, SubscriptionsViewModel } from "@/features/admin/domain/entities/subscriptions";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildSubscriptionsHref } from "@/features/admin/presentation/state/subscriptions-route-state";

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

function SubscriptionStatusBadge({ row }: { row: SubscriptionRow }) {
  if (row.cancelAtPeriodEnd && (row.status === "active" || row.status === "past_due")) {
    return <AdminStatusBadge label="Canceling" toneClassName="border-[#ef4335]/45 bg-transparent text-[#ef4335]" />;
  }
  const cls =
    row.status === "active"
      ? "border-[#0cbc32]/40 bg-transparent text-[#0cbc32]"
      : row.status === "pending"
        ? "border-[#f0c400]/45 bg-transparent text-[#f0c400]"
        : row.status === "past_due"
          ? "border-[#f0c400]/45 bg-transparent text-[#f0c400]"
          : row.status === "expired"
            ? "border-[#8d9aa8]/45 bg-transparent text-[#8d9aa8]"
            : "border-[#ef4335]/45 bg-transparent text-[#ef4335]";
  const label =
    row.status === "active"
      ? "Active"
      : row.status === "pending"
        ? "Pending"
        : row.status === "past_due"
          ? "Past Due"
          : row.status === "expired"
            ? "Expired"
            : "Canceled";
  return <AdminStatusBadge label={label} toneClassName={cls} />;
}

function SubscriptionActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: SubscriptionRow;
  viewModel: SubscriptionsViewModel;
  onView?: (row: SubscriptionRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;
  const isCancelable = (row.status === "active" || row.status === "past_due" || row.status === "pending") && !row.cancelAtPeriodEnd;

  return (
    <AdminActionMenuPanel
      className={`absolute right-0 z-50 min-w-[156px] rounded-[12px] border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}
    >
      <button
        type="button"
        onClick={() => onView?.(row)}
        className="block w-full border-b border-white/10 px-4 py-3 text-left text-[14px] text-white/80 hover:bg-white/[0.04]"
      >
        View details
      </button>
      {isCancelable ? (
        <Link
          href={buildSubscriptionsHref({ tab: viewModel.activeTab, cancel: row.id })}
          className="block px-4 py-3 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
        >
          Cancel subscription
        </Link>
      ) : null}
    </AdminActionMenuPanel>
  );
}

function paginationHref(viewModel: SubscriptionsViewModel, page: number) {
  return buildSubscriptionsHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery,
    page,
  });
}

export function SubscriptionsTable({
  viewModel,
  onTabChange,
  onOpenMenu,
  onCloseMenu,
  onView,
}: {
  viewModel: SubscriptionsViewModel;
  onTabChange?: (tab: SubscriptionTab) => void;
  onOpenMenu?: (row: SubscriptionRow) => void;
  onCloseMenu?: () => void;
  onView?: (row: SubscriptionRow) => void;
}) {
  const showHeaderBadge = viewModel.activeTab !== "all";
  const tableGridClass = "grid min-w-[880px] grid-cols-[54px_1fr_1fr_1fr_86px_1fr_1fr_98px_36px]";

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[15px] text-white/50">{viewModel.pageDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {viewModel.topStats.map((stat) => (
            <TopStatPill key={stat.label} label={stat.label} tone={stat.tone} />
          ))}
          <Link
            href="/subscriptions/pricing"
            className="inline-flex h-9 items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] font-semibold text-[#c590ff]"
          >
            Manage Pricing
          </Link>
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
          {showHeaderBadge ? (
            <div className="flex flex-wrap items-center gap-3">
              <TopStatPill label={viewModel.tableBadge.subscribersLabel} tone="info" />
              <span className="text-white/30">⋮</span>
            </div>
          ) : (
            <span className="text-white/30">⋮</span>
          )}
        </div>

        <div className="overflow-x-auto">
          {viewModel.phaseState === "loading" ? (
            <div className="px-8 py-16 text-center text-white/70">Loading subscriptions...</div>
          ) : null}
          {viewModel.phaseState === "error" ? (
            <AdminErrorState title="Unable to load subscriptions" message={viewModel.errorMessage} />
          ) : null}
          {viewModel.phaseState === "empty" ? (
            <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">No Subscriptions Yet</div>
          ) : null}
          {viewModel.phaseState === "populated" ? (
            <>
              <div className={`${tableGridClass} bg-[var(--color-surface-elevated)] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
                <span>S/N</span>
                <span>Reference</span>
                <span>Name</span>
                <span>Email</span>
                <span>Amount</span>
                <span>Renews on</span>
                <span>Date</span>
                <span>Status</span>
                <span> </span>
              </div>
              {viewModel.rows.map((row, index) => (
                <div
                  key={row.id}
                  className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[18px] text-[11px] text-white/86`}
                >
                  <span>{viewModel.activeTab === "all" ? row.id : index + 1}</span>
                  <span className="whitespace-nowrap text-white/75">{row.reference}</span>
                  <span>{row.subscriber}</span>
                  <span className="truncate text-white/72">{row.email}</span>
                  <span>{row.amount}</span>
                  <span>{row.renewsOn}</span>
                  <span>{row.date}</span>
                  <span>
                    <SubscriptionStatusBadge row={row} />
                  </span>
                  <div className="relative flex justify-end text-white/70">
                    <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for subscription ${row.id}`}>
                      <AdminRowMenuIcon />
                    </button>
                    {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? (
                      <SubscriptionActionMenu row={row} viewModel={viewModel} onView={onView} />
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
            <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close subscriptions action menu" />
          ) : (
            <AdminActionMenuBackdrop
              href={buildSubscriptionsHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
              label="Close subscriptions action menu"
            />
          )
        ) : null}
      </div>
    </div>
  );
}
