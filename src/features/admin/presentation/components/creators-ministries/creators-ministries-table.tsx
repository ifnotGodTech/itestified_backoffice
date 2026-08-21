import Link from "next/link";
import type {
  CreatorMinistryRow,
  CreatorMinistryTab,
  CreatorsMinistriesViewModel,
} from "@/features/admin/domain/entities/creators-ministries";
import { toDateLabel } from "@/features/admin/data/services/get-creators-ministries-view-model";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildCreatorsMinistriesHref } from "@/features/admin/presentation/state/creators-ministries-route-state";

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

function CreatorStatusBadge({ row }: { row: CreatorMinistryRow }) {
  if (row.isVerified) {
    return <AdminStatusBadge label="Verified" toneClassName="border-[#0cbc32]/40 bg-transparent text-[#0cbc32]" />;
  }
  if (row.verificationRequestedAt) {
    return <AdminStatusBadge label="Requested" toneClassName="border-[#f0c400]/45 bg-transparent text-[#f0c400]" />;
  }
  return <AdminStatusBadge label="Not requested" toneClassName="border-[#8d9aa8]/45 bg-transparent text-[#8d9aa8]" />;
}

function RowAvatar({ row }: { row: CreatorMinistryRow }) {
  const initial = row.displayName.trim().charAt(0).toUpperCase() || "M";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#9B68D5]/15 text-[12px] font-bold text-[#c590ff]">
      {initial}
    </span>
  );
}

function CreatorActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: CreatorMinistryRow;
  viewModel: CreatorsMinistriesViewModel;
  onView?: (row: CreatorMinistryRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;

  return (
    <AdminActionMenuPanel
      className={`absolute right-0 z-50 min-w-[170px] rounded-[12px] border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}
    >
      <button
        type="button"
        onClick={() => onView?.(row)}
        className="block w-full border-b border-white/10 px-4 py-3 text-left text-[14px] text-white/80 hover:bg-white/[0.04]"
      >
        View full profile
      </button>
      {row.isVerified ? (
        <Link
          href={buildCreatorsMinistriesHref({ tab: viewModel.activeTab, unverify: row.id })}
          className="block px-4 py-3 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
        >
          Revoke verification
        </Link>
      ) : (
        <Link
          href={buildCreatorsMinistriesHref({ tab: viewModel.activeTab, verify: row.id })}
          className="block px-4 py-3 text-[14px] text-[#0cbc32] hover:bg-white/[0.04]"
        >
          Verify Ministry
        </Link>
      )}
    </AdminActionMenuPanel>
  );
}

function paginationHref(viewModel: CreatorsMinistriesViewModel, page: number) {
  return buildCreatorsMinistriesHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery,
    page,
  });
}

export function CreatorsMinistriesTable({
  viewModel,
  onTabChange,
  onOpenMenu,
  onCloseMenu,
  onView,
}: {
  viewModel: CreatorsMinistriesViewModel;
  onTabChange?: (tab: CreatorMinistryTab) => void;
  onOpenMenu?: (row: CreatorMinistryRow) => void;
  onCloseMenu?: () => void;
  onView?: (row: CreatorMinistryRow) => void;
}) {
  const tableGridClass = "grid min-w-[920px] grid-cols-[44px_1.4fr_1.2fr_90px_120px_130px_1.1fr_36px]";

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

        {viewModel.activeTab === "queue" ? (
          <p className="px-6 pb-1 pt-4 text-[12.5px] text-white/40">
            Ordered oldest request first — the same convention as the moderation queue.
          </p>
        ) : null}

        <div className="overflow-x-auto">
          {viewModel.phaseState === "loading" ? (
            <div className="px-8 py-16 text-center text-white/70">Loading Ministry profiles...</div>
          ) : null}
          {viewModel.phaseState === "error" ? (
            <AdminErrorState title="Unable to load Ministry profiles" message={viewModel.errorMessage} />
          ) : null}
          {viewModel.phaseState === "empty" ? (
            <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">
              {viewModel.activeTab === "queue" ? "No pending verification requests" : "No Ministry profiles yet"}
            </div>
          ) : null}
          {viewModel.phaseState === "populated" ? (
            <>
              <div className={`${tableGridClass} bg-[var(--color-surface-elevated)] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
                <span> </span>
                <span>Ministry</span>
                <span>Email</span>
                <span>Followers</span>
                <span>Status</span>
                <span>Requested</span>
                <span>Verified by</span>
                <span> </span>
              </div>
              {viewModel.rows.map((row) => (
                <div
                  key={row.id}
                  className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[16px] text-[12px] text-white/86`}
                >
                  <RowAvatar row={row} />
                  <span className="truncate font-medium">{row.displayName}</span>
                  <span className="truncate text-white/72">{row.email}</span>
                  <span>{row.followerCount.toLocaleString()}</span>
                  <span>
                    <CreatorStatusBadge row={row} />
                  </span>
                  <span className="text-white/60">{toDateLabel(row.verificationRequestedAt)}</span>
                  <span className="truncate text-white/60">{row.verifiedByEmail ?? "—"}</span>
                  <div className="relative flex justify-end text-white/70">
                    <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for ${row.displayName}`}>
                      <AdminRowMenuIcon />
                    </button>
                    {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? (
                      <CreatorActionMenu row={row} viewModel={viewModel} onView={onView} />
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
            <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close Ministry action menu" />
          ) : (
            <AdminActionMenuBackdrop
              href={buildCreatorsMinistriesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
              label="Close Ministry action menu"
            />
          )
        ) : null}
      </div>
    </div>
  );
}
