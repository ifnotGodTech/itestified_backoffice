import { RemoteImage } from "@/core/ui/remote-image";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type { HomeManagementRow, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { buildHomeManagementHref } from "@/features/admin/presentation/state/home-management-route-state";

function CloseControl({
  href,
  onClose,
  className,
  label,
  children,
}: {
  href: string;
  onClose?: () => void;
  className: string;
  label: string;
  children: ReactNode;
}) {
  if (onClose) {
    return (
      <button type="button" onClick={onClose} className={className} aria-label={label}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

function detailCloseHref(viewModel: HomeManagementViewModel) {
  return buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount });
}

function PictureDetailArt({ row }: { row: HomeManagementRow }) {
  return (
    <div className="relative aspect-[1.74] w-full overflow-hidden rounded-[18px] bg-[var(--color-surface-muted)]">
      {row.thumbnailSrc ? <RemoteImage src={row.thumbnailSrc} alt={row.thumbnailLabel} fill sizes="560px" className="object-cover" /> : null}
    </div>
  );
}

function HomeManagementPictureModal({
  row,
  viewModel,
  onClose,
}: {
  row: HomeManagementRow;
  viewModel: HomeManagementViewModel;
  onClose?: () => void;
}) {
  const href = detailCloseHref(viewModel);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <CloseControl href={href} onClose={onClose} className="absolute inset-0" label="Close picture details modal">
        <span className="sr-only">Close picture details modal</span>
      </CloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--color-surface-elevated)] px-6 py-5">
          <h2 className="text-[24px] font-semibold text-white">Picture Details</h2>
          <CloseControl href={href} onClose={onClose} className="text-[34px] leading-none text-white/90" label="Dismiss picture details">
            ×
          </CloseControl>
        </div>
        <div className="overflow-y-auto px-6 pb-8 pt-5">
          <PictureDetailArt row={row} />
          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-8 gap-y-4 text-[16px] text-white/90">
            <dt className="text-white/75">Title</dt>
            <dd className="font-semibold text-right">{row.title}</dd>
            <dt className="text-white/75">Uploaded By</dt>
            <dd className="font-semibold text-right">{row.uploadedBy}</dd>
            <dt className="text-white/75">Upload Date</dt>
            <dd className="font-semibold text-right">{row.dateUploaded}</dd>
            <dt className="text-white/75">Source</dt>
            <dd className="font-semibold text-right">{row.source}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function HomeManagementRemoveModal({ viewModel, onClose }: { viewModel: HomeManagementViewModel; onClose: () => void }) {
  const selected = viewModel.selectedRow;
  const href = buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount });
  const removeHref = `/api/admin/content/home-curation/featured-pictures/${selected?.id}/remove`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <CloseControl href={href} onClose={onClose} className="absolute inset-0" label="Close remove from home page modal">
        <span className="sr-only">Close remove from home page modal</span>
      </CloseControl>
      <div className="relative w-full max-w-[600px] rounded-[22px] bg-[var(--color-surface-elevated)] px-8 pb-8 pt-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <CloseControl href={href} onClose={onClose} className="absolute right-6 top-6 text-[34px] leading-none text-white/90" label="Close remove from home page modal">
          ×
        </CloseControl>
        <h2 className="text-[24px] font-semibold text-white">Remove from Home Page?</h2>
        <p className="mx-auto mt-6 max-w-[470px] text-[18px] leading-9 text-white/75">
          This will remove the picture from the app&apos;s Home feed. It will still be available elsewhere and users can view it.
          <br />
          Are you sure you want to proceed?
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <CloseControl
            href={href}
            onClose={onClose}
            className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[18px] text-[#9B68D5]"
            label="Cancel remove from home page"
          >
            Cancel
          </CloseControl>
          <form action={removeHref} method="POST">
            <button
              type="submit"
              className="inline-flex min-w-[180px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[18px] text-white"
            >
              Yes, remove
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function HomeManagementSuccessModal({ viewModel, onClose }: { viewModel: HomeManagementViewModel; onClose: () => void }) {
  const href = buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount });
  const noun = "Picture";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <CloseControl href={href} onClose={onClose} className="absolute inset-0" label="Close success modal">
        <span className="sr-only">Close success modal</span>
      </CloseControl>
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface-elevated)] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-full bg-[#9B68D5] text-[78px] text-white">✓</div>
        <p className="mt-12 text-[30px] font-semibold leading-[1.3] text-white">{noun} Removed Successfully!</p>
      </div>
    </div>
  );
}

function HomeManagementActionMenu({
  row,
  viewModel,
  onClose,
  onView,
}: {
  row: HomeManagementRow;
  viewModel: HomeManagementViewModel;
  onClose?: () => void;
  onView?: (row: HomeManagementRow) => void;
}) {
  return (
    <div className="fixed inset-0 z-40">
      {onClose ? (
        <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close action menu" />
      ) : (
        <Link href={detailCloseHref(viewModel)} className="absolute inset-0" aria-label="Close action menu" />
      )}
      <div className="absolute bottom-8 right-8 z-50 min-w-[102px] overflow-hidden rounded-[12px] border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={() => onView?.(row)}
          className="block w-full border-b border-white/10 px-5 py-2 text-left text-[14px] text-white/90 hover:bg-white/[0.04]"
        >
          View
        </button>
        <Link
          href={buildHomeManagementHref({ tab: viewModel.activeTab, rule: viewModel.displayRule, count: viewModel.testimonyCount, removeId: row.id })}
          className="block px-5 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
        >
          Remove
        </Link>
      </div>
    </div>
  );
}

export function HomeManagementOverlays({
  viewModel,
  detailRow,
  onCloseMenu,
  onView,
  onCloseDetails,
}: {
  viewModel: HomeManagementViewModel;
  detailRow?: HomeManagementRow | null;
  onCloseMenu?: () => void;
  onView?: (row: HomeManagementRow) => void;
  onCloseDetails?: () => void;
}) {
  const [dismissedOverlayKey, setDismissedOverlayKey] = useState<string | null>(null);
  const selectedRow = detailRow ?? viewModel.selectedRow;
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;
  const detailKey = selectedRow ? `view:${selectedRow.id}` : "view";
  const removeKey = viewModel.selectedRow ? `remove:${viewModel.selectedRow.id}` : "remove";
  const showDetails = (Boolean(detailRow) || viewModel.showDetails) && !isDismissed(detailKey, "view");

  function isDismissed(key: string, paramName: string) {
    return dismissedOverlayKey === key && !currentSearch.includes(`${paramName}=`);
  }

  function dismissRouteOverlay(key: string) {
    setDismissedOverlayKey(key);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", detailCloseHref(viewModel));
    }
  }

  const closeDetails = detailRow ? onCloseDetails : () => dismissRouteOverlay(detailKey);
  return (
    <>
      {viewModel.showActionMenu && viewModel.selectedRow ? <HomeManagementActionMenu row={viewModel.selectedRow} viewModel={viewModel} onClose={onCloseMenu} onView={onView} /> : null}
      {showDetails && selectedRow?.kind === "picture" ? <HomeManagementPictureModal row={selectedRow} viewModel={viewModel} onClose={closeDetails} /> : null}
      {viewModel.showRemoveConfirm && viewModel.selectedRow && !isDismissed(removeKey, "remove") ? <HomeManagementRemoveModal viewModel={viewModel} onClose={() => dismissRouteOverlay(removeKey)} /> : null}
      {viewModel.showSuccess && !isDismissed("success", "success") ? <HomeManagementSuccessModal viewModel={viewModel} onClose={() => dismissRouteOverlay("success")} /> : null}
    </>
  );
}
