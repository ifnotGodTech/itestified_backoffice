import Image from "next/image";
import Link from "next/link";
import type { ReviewsViewModel } from "@/features/admin/domain/entities/reviews";
import { buildReviewsHref } from "@/features/admin/presentation/state/reviews-route-state";

function closeHref(viewModel: ReviewsViewModel) {
  return buildReviewsHref({
    rating: viewModel.filterDraft.rating ? String(viewModel.filterDraft.rating) : null,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    selected: viewModel.selectedIds.join(",") || null,
  });
}

function RatingOptions({ selected }: { selected?: number }) {
  const values = [5, 4, 3, 2, 1, 0];
  return (
    <div className="overflow-hidden rounded-[8px] border border-white/14">
      {values.map((value) => (
        <div key={value} className={`flex h-[28px] items-center border-t border-white/10 px-3 text-[12px] ${value === values[0] ? "border-t-0" : ""}`}>
          <span className={value === selected ? "text-[#9B68D5]" : "text-white/78"}>
            {value > 0 ? "★".repeat(value) : ""}
            <span className="text-white/32">{value < 5 ? "★".repeat(5 - value) : ""}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ReviewsOverlays({ viewModel }: { viewModel: ReviewsViewModel }) {
  return (
    <>
      {viewModel.showFilterModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 px-6 py-24">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close reviews filter modal" />
          <form action="/reviews" className="relative z-10 w-full max-w-[353px] overflow-hidden rounded-[20px] border border-white/15 bg-[#1d1d1d] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <input type="hidden" name="selected" value={viewModel.selectedIds.join(",")} />
            <div className="border-b border-white/10 px-4 py-4">
              <h2 className="text-[14px] font-normal text-white">Filter</h2>
            </div>
            <div className="px-4 py-4">
              <div className="border-b border-white/10 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Rating</p>
                  <Link href={buildReviewsHref({ filter: true, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, selected: viewModel.selectedIds.join(",") || null })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="mb-2 flex h-[32px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80">
                  <span>{viewModel.filterDraft.rating ? `${"★".repeat(viewModel.filterDraft.rating)}${"★".repeat(5 - viewModel.filterDraft.rating)}` : "Select"}</span>
                  <span>▴</span>
                </div>
                <RatingOptions selected={viewModel.filterDraft.rating} />
              </div>
              <div className="pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Date Range</p>
                  <Link href={buildReviewsHref({ filter: true, rating: viewModel.filterDraft.rating ? String(viewModel.filterDraft.rating) : null, selected: viewModel.selectedIds.join(",") || null })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-[12px] text-white/55">From</p>
                    <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] text-white/55">To</p>
                    <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 px-4 pb-4 pt-1">
              <Link href={buildReviewsHref({ filter: true, selected: viewModel.selectedIds.join(",") || null })} className="inline-flex h-[40px] items-center rounded-[10px] border border-[#9B68D5] px-6 text-[14px] text-[#b27bff]">Clear All</Link>
              <button type="submit" className="inline-flex h-[40px] items-center rounded-[10px] bg-[#9B68D5] px-6 text-[14px] text-white">Apply</button>
            </div>
          </form>
        </div>
      ) : null}

      {viewModel.showDetailForId && viewModel.selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close review detail modal" />
          <div className="relative z-10 w-full max-w-[561px] max-h-[calc(100vh-48px)] overflow-y-auto rounded-[24px] bg-[#1c1c1c] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Link href={closeHref(viewModel)} className="absolute right-[14px] top-[8px] text-[34px] leading-none text-white/90" aria-label="Close review detail modal">×</Link>
            <div className="flex h-[110px] items-end justify-center bg-[#272727]">
              <div className="translate-y-[50px] overflow-hidden rounded-full border-[6px] border-white bg-white">
                <Image src="/admin-avatar.png" alt={viewModel.selectedRow.name} width={100} height={100} className="h-[100px] w-[100px] object-cover" />
              </div>
            </div>
            <div className="px-9 pb-8 pt-[72px]">
              <div className="rounded-[16px] border border-white/8 px-4 py-4">
                <dl className="grid gap-4">
                  <div>
                    <dt className="text-[14px] text-white/58">Email Address</dt>
                    <dd className="mt-1 text-[16px] text-white">{viewModel.selectedRow.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-white/58">Name</dt>
                    <dd className="mt-1 text-[16px] text-white">{viewModel.selectedRow.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-white/58">Date</dt>
                    <dd className="mt-1 text-[16px] text-white">{viewModel.selectedRow.dateSubmitted}</dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-white/58">Rating</dt>
                    <dd className="mt-1 text-[16px] text-[#9B68D5]">{"★".repeat(viewModel.selectedRow.rating)}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-5">
                <h3 className="text-[18px] font-semibold text-white">Review</h3>
                <p className="mt-4 text-[18px] leading-[1.45] text-white/72">
                  {viewModel.selectedRow.id === 1
                    ? "I really enjoy using the app! The interface is intuitive, and I've had a great experience so far. However, it could use a few additional features to make it perfect"
                    : viewModel.selectedRow.id === 2
                      ? "The app works well, but there are a few areas where the experience could be improved to feel smoother and more complete."
                      : "I love how simple it is to use. Everything feels straightforward and easy to understand from the first interaction."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {viewModel.showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete review modal" />
          <div className="relative z-10 w-full max-w-[578px] rounded-[20px] bg-[#1f1f1f] px-10 pb-10 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h2 className="text-[24px] font-semibold text-white">{viewModel.deleteMode === "bulk" ? "Delete all reviews?" : "Delete review?"}</h2>
            <p className="mx-auto mt-8 max-w-[530px] text-[20px] leading-[1.36] text-white/78">
              {viewModel.deleteMode === "bulk"
                ? "Are you sure you want to delete all selected reviews? This action cannot be undone, and all reviews will be permanently removed from the system."
                : "Are you sure you want to delete this review? This action cannot be undone."}
            </p>
            <div className="mt-14 flex justify-center gap-6">
              <Link href={closeHref(viewModel)} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]">Cancel</Link>
              <Link href={closeHref(viewModel)} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] bg-[#ef3931] px-6 text-[16px] text-white">{viewModel.deleteMode === "bulk" ? "Delete All" : "Yes, delete"}</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
