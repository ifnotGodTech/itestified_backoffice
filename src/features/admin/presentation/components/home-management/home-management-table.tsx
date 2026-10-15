import Image from "next/image";
import type { HomeManagementRow, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";

function ThumbnailCell({ row }: { row: HomeManagementRow }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative h-8 w-8 overflow-hidden rounded bg-[var(--color-surface-muted)]">
        {row.thumbnailSrc ? <Image src={row.thumbnailSrc} alt={row.thumbnailLabel} fill sizes="64px" className="object-cover opacity-80" /> : null}
      </span>
    </div>
  );
}

function HomeManagementTableLoading() {
  const gridClass = "grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_74px_54px]";
  const cellCount = 10;

  return (
    <div className="space-y-3 px-3 py-4">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <div key={rowIndex} className={`${gridClass} items-center gap-0`}>
          {Array.from({ length: cellCount }).map((__, cellIndex) => (
            <span key={`${rowIndex}-${cellIndex}`} className="mx-2 h-6 animate-pulse rounded bg-white/8" />
          ))}
        </div>
      ))}
    </div>
  );
}

function HomeManagementTableEmpty() {
  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto max-w-[420px] space-y-3">
        <h3 className="text-[22px] font-semibold text-white">No featured pictures yet</h3>
        <p className="text-[16px] leading-7 text-white/65">
          Add a published inspirational picture and it will appear between testimonies in the app&apos;s Home feed.
        </p>
      </div>
    </div>
  );
}

function HomeManagementTableError({ message }: { message?: string }) {
  return <AdminErrorState title="Unable to load home page content" message={message} />;
}

function HomeManagementPictureTable({
  viewModel,
  onOpenMenu,
  onMoveFeaturedPicture,
}: {
  viewModel: HomeManagementViewModel;
  onOpenMenu?: (row: HomeManagementRow) => void;
  onMoveFeaturedPicture?: (id: number, direction: "up" | "down") => void;
}) {
  return (
    <>
      <div className="grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_74px_54px] bg-[var(--color-surface-muted)] px-3 py-[9px] text-[10px] font-medium text-white/70">
        <span>S/N</span>
        <span>Thumbnail</span>
        <span>Title</span>
        <span>Source</span>
        <span>Date Uploaded</span>
        <span>Uploaded By</span>
        <span>Downloads</span>
        <span>Shares</span>
        <span>Order</span>
        <span>Action</span>
      </div>
      {viewModel.rows.map((row) => {
        const featuredIndex = viewModel.featuredPictureOrder.findIndex((item) => item.id === row.id);
        return (
          <div
            key={row.id}
            className="grid grid-cols-[64px_72px_1.3fr_1fr_1fr_1.2fr_0.9fr_0.8fr_74px_54px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85"
          >
            <span>{row.id}</span>
            <ThumbnailCell row={row} />
            <span>{row.title}</span>
            <span>{row.source}</span>
            <span>{row.dateUploaded}</span>
            <span>{row.uploadedBy}</span>
            <span>{row.downloads ?? 0}</span>
            <span>{row.shares}</span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={featuredIndex <= 0}
                onClick={() => onMoveFeaturedPicture?.(row.id, "up")}
                aria-label={`Move ${row.title} up in featured order`}
                className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-white/15 text-[11px] text-white/80 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={featuredIndex === -1 || featuredIndex >= viewModel.featuredPictureOrder.length - 1}
                onClick={() => onMoveFeaturedPicture?.(row.id, "down")}
                aria-label={`Move ${row.title} down in featured order`}
                className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-white/15 text-[11px] text-white/80 disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <div className="text-right text-[18px]">
              <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open home content actions ${row.id}`}>
                ⋯
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function HomeManagementContentTable({
  viewModel,
  onOpenMenu,
  onMoveFeaturedPicture,
}: {
  viewModel: HomeManagementViewModel;
  onOpenMenu?: (row: HomeManagementRow) => void;
  onMoveFeaturedPicture?: (id: number, direction: "up" | "down") => void;
}) {
  const showTableData = viewModel.phaseState === "populated";

  return (
    <div className="overflow-hidden rounded-[18px] bg-[var(--color-surface-elevated)]">
      <div className="px-4 pb-3 pt-4 text-[16px] font-medium text-white/90">Featured Pictures</div>
      <div className="border-t border-white/5">
        {viewModel.phaseState === "loading" ? <HomeManagementTableLoading /> : null}
        {viewModel.phaseState === "empty" ? <HomeManagementTableEmpty /> : null}
        {viewModel.phaseState === "error" ? <HomeManagementTableError message={viewModel.errorMessage} /> : null}
        {showTableData ? (
          <HomeManagementPictureTable viewModel={viewModel} onOpenMenu={onOpenMenu} onMoveFeaturedPicture={onMoveFeaturedPicture} />
        ) : null}
      </div>
    </div>
  );
}
