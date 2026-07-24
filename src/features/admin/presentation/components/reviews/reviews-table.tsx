import Link from "next/link";
import {
  AdminActionMenuPanel,
  AdminErrorState,
  AdminPaginationFooter,
  AdminRowMenuIcon,
  AdminSearchIcon,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { ReviewRow, ReviewsViewModel } from "@/features/admin/domain/entities/reviews";
import { buildReviewsHref } from "@/features/admin/presentation/state/reviews-route-state";

function paginationHref(viewModel: ReviewsViewModel, page: number) {
  return buildReviewsHref({
    q: viewModel.searchQuery || null,
    rating: viewModel.filterDraft.rating ? String(viewModel.filterDraft.rating) : null,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    page,
  });
}

function selectionHref(viewModel: ReviewsViewModel, id: number) {
  const current = new Set(viewModel.selectedIds);
  if (current.has(id)) current.delete(id);
  else current.add(id);
  return buildReviewsHref({
    rating: viewModel.filterDraft.rating ? String(viewModel.filterDraft.rating) : null,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    selected: Array.from(current).sort((a, b) => a - b).join(",") || null,
  });
}

function selectAllHref(viewModel: ReviewsViewModel) {
  return buildReviewsHref({
    rating: viewModel.filterDraft.rating ? String(viewModel.filterDraft.rating) : null,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    selected: viewModel.selectedIds.length === viewModel.rows.length ? null : viewModel.rows.map((row) => row.id).join(","),
  });
}

function ReviewCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className={`inline-flex h-[12px] w-[12px] items-center justify-center rounded-[2px] border ${checked ? "border-[#9B68D5] bg-[#9B68D5]" : "border-white/35 bg-transparent"}`}>
      {checked ? (
        <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]" fill="none" aria-hidden="true">
          <path d="M2.3 6.1 4.9 8.6 9.6 3.7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap text-[12px] tracking-[1px] text-[#9B68D5]">
      {"★".repeat(rating)}
      <span className="text-white/30">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewMenu({
  row,
  viewModel,
  onCloseMenu,
  onView,
}: {
  row: ReviewRow;
  viewModel: ReviewsViewModel;
  onCloseMenu?: () => void;
  onView?: (row: ReviewRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 1;
  return (
    <>
      {onCloseMenu ? (
        <button type="button" onClick={onCloseMenu} className="fixed inset-0 z-40" aria-label="Close review action menu" />
      ) : (
        <Link href={buildReviewsHref({ selected: viewModel.selectedIds.join(",") || null })} className="fixed inset-0 z-40" aria-label="Close review action menu" />
      )}
      <AdminActionMenuPanel className={`absolute right-0 z-50 min-w-[104px] rounded-[8px] border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] ${openUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}`}>
        <button type="button" onClick={() => onView?.(row)} className="block w-full border-b border-white/10 px-3 py-[10px] text-left text-[10px] text-white/85">
          View details
        </button>
        <Link href={buildReviewsHref({ remove: row.id, selected: viewModel.selectedIds.join(",") || null })} className="block px-3 py-[10px] text-[10px] text-[#ef4335]">
          Delete
        </Link>
      </AdminActionMenuPanel>
    </>
  );
}

export function ReviewsTable({
  viewModel,
  onOpenFilter,
  onOpenMenu,
  onCloseMenu,
  onView,
}: {
  viewModel: ReviewsViewModel;
  onOpenFilter?: () => void;
  onOpenMenu?: (row: ReviewRow) => void;
  onCloseMenu?: () => void;
  onView?: (row: ReviewRow) => void;
}) {
  const hasSelection = viewModel.selectedIds.length > 0;
  const tableColumns = hasSelection
    ? "grid-cols-[32px_42px_1fr_1.7fr_132px_132px_40px]"
    : "grid-cols-[32px_84px_1fr_1.25fr_1.6fr_140px_138px_40px]";

  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{viewModel.pageTitle}</h1>
        <p className="mt-2 text-[15px] text-white/50">{viewModel.pageDescription}</p>
      </div>
      <div className="mt-7 rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 px-[14px] py-[12px] sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[16px] font-normal text-white">Reviews</h2>
          <div className="flex flex-wrap items-center gap-3">
            {hasSelection ? (
              <Link href={buildReviewsHref({ selected: viewModel.selectedIds.join(","), deleteAll: true })} className="inline-flex h-[28px] items-center gap-[5px] rounded-[8px] bg-[#ef3931] px-4 text-[12px] text-white">
                <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" fill="none" aria-hidden="true">
                  <path d="M5.5 5.5v6M8 5.5v6m2.5-6v6M3.5 4h9M6 4V2.9c0-.2.16-.4.36-.4h3.28c.2 0 .36.2.36.4V4m-5.9 0 .38 8.15c.02.39.34.7.73.7h5.58c.39 0 .71-.31.73-.7L12.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete
              </Link>
            ) : null}
            <div className="relative w-full sm:w-[220px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35">
                <AdminSearchIcon />
              </span>
              <input
                readOnly
                placeholder={hasSelection ? viewModel.bulkSearchPlaceholder : viewModel.searchPlaceholder}
                className="h-[28px] w-full rounded-[8px] bg-[var(--color-surface-muted)] pl-9 pr-3 text-[10px] text-white/70 placeholder:text-white/28 outline-none"
              />
            </div>
            <button type="button" onClick={onOpenFilter} className="inline-flex h-[28px] items-center gap-2 rounded-[8px] border border-[#9B68D5] px-3 text-[12px] text-[#b27bff]">
              <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" fill="none" aria-hidden="true">
                <path d="M3 4h10M5 8h6M6.5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className={`grid ${tableColumns} items-center bg-[var(--color-surface-muted)] px-[10px] py-[8px] text-[10px] text-white/90`}>
              <Link href={selectAllHref(viewModel)} aria-label="Select all reviews" className="inline-flex items-center justify-center">
                <ReviewCheckbox checked={viewModel.selectedIds.length === viewModel.rows.length && viewModel.rows.length > 0} />
              </Link>
              <span>{hasSelection ? "S/N" : "Review ID ↕"}</span>
              <span>Name ↕</span>
              {hasSelection ? null : <span>Email Address ↕</span>}
              <span>Review ↕</span>
              <span>Rating ↕</span>
              <span>Date Submitted ↕</span>
              <span>Action</span>
            </div>

            {viewModel.phaseState === "populated"
              ? viewModel.rows.map((row, index) => (
                  <div key={row.id} className={`grid ${tableColumns} items-center gap-[10px] border-t border-white/10 px-[10px] py-[12px]`}>
                    <Link href={selectionHref(viewModel, row.id)} aria-label={`Select review ${row.id}`} className="inline-flex items-center justify-center">
                      <ReviewCheckbox checked={viewModel.selectedIds.includes(row.id)} />
                    </Link>
                    <span className="text-[12px] text-white/72">{hasSelection ? index + 1 : row.reviewId}</span>
                    <span className="truncate text-[12px] text-white/85">{row.name}</span>
                    {hasSelection ? null : <span className="truncate text-[12px] text-white/72">{row.email}</span>}
                    <span className="truncate text-[12px] text-white/72">{row.review}</span>
                    <Stars rating={row.rating} />
                    <span className="text-[12px] text-white/72">{row.dateSubmitted}</span>
                    <div className="relative flex justify-end">
                      <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open review actions ${row.id}`} className="text-white/60">
                        <AdminRowMenuIcon />
                      </button>
                      {viewModel.showMenuForId === row.id ? <ReviewMenu row={row} viewModel={viewModel} onCloseMenu={onCloseMenu} onView={onView} /> : null}
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>

        {viewModel.phaseState === "loading" ? <div className="px-8 py-16 text-center text-white/70">Loading reviews...</div> : null}
        {viewModel.phaseState === "error" ? <AdminErrorState title="Unable to load reviews" message={viewModel.errorMessage} /> : null}
        {viewModel.phaseState === "empty" ? <div className="px-8 py-16 text-center text-[18px] font-medium text-white/90">No Reviews Yet</div> : null}

        <AdminPaginationFooter
          showingLabel={viewModel.showingLabel}
          hasPreviousPage={viewModel.hasPreviousPage}
          hasNextPage={viewModel.hasNextPage}
          previousHref={paginationHref(viewModel, viewModel.page - 1)}
          nextHref={paginationHref(viewModel, viewModel.page + 1)}
        />
      </div>
    </div>
  );
}
