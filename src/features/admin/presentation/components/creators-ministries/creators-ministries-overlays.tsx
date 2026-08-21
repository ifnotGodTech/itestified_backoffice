import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type { CreatorMinistryRow, CreatorsMinistriesViewModel } from "@/features/admin/domain/entities/creators-ministries";
import { toDateLabel } from "@/features/admin/data/services/get-creators-ministries-view-model";
import { buildCreatorsMinistriesHref } from "@/features/admin/presentation/state/creators-ministries-route-state";

function closeHref(viewModel: CreatorsMinistriesViewModel) {
  return buildCreatorsMinistriesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery });
}

function OverlayShell({ children, closeLabel, onClose }: { children: ReactNode; closeLabel: string; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      {onClose ? (
        <button type="button" onClick={onClose} className="absolute inset-0" aria-label={closeLabel} />
      ) : (
        <div className="absolute inset-0" aria-label={closeLabel} />
      )}
      {children}
    </div>
  );
}

function CloseX() {
  return <span className="text-[36px] leading-none text-white/90">×</span>;
}

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

// Unlike Donations/Subscriptions, the list row (AdminCreatorProfileSerializer)
// already carries every field this modal needs -- no separate lazy detail
// fetch/endpoint exists or is needed here.
function CreatorDetailBody({ row }: { row: CreatorMinistryRow }) {
  return (
    <>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#9B68D5]/15 text-[16px] font-bold text-[#c590ff]">
          {row.displayName.trim().charAt(0).toUpperCase() || "M"}
        </span>
        <div>
          <p className="text-[16px] font-semibold text-white">{row.displayName}</p>
          <p className="text-[13px] text-white/50">{row.email}</p>
        </div>
      </div>
      {row.bio ? <p className="mt-4 text-[14px] leading-6 text-white/70">{row.bio}</p> : null}
      <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
          <dt className="text-white/45">Followers</dt>
          <dd className="text-white">{row.followerCount.toLocaleString()}</dd>
          <dt className="text-white/45">Status</dt>
          <dd className="text-white">
            {row.isVerified ? "Verified" : row.verificationRequestedAt ? "Requested" : "Not requested"}
          </dd>
          <dt className="text-white/45">Verification requested</dt>
          <dd className="text-white">{toDateLabel(row.verificationRequestedAt)}</dd>
          <dt className="text-white/45">Verified on</dt>
          <dd className="text-white">{toDateLabel(row.verifiedAt)}</dd>
          <dt className="text-white/45">Verified by</dt>
          <dd className="text-white">{row.verifiedByEmail ?? "—"}</dd>
          <dt className="text-white/45">Profile created</dt>
          <dd className="text-white">{toDateLabel(row.createdAt)}</dd>
        </dl>
      </div>
    </>
  );
}

export function CreatorsMinistriesOverlays({
  viewModel,
  detailRow,
  onCloseDetails,
}: {
  viewModel: CreatorsMinistriesViewModel;
  detailRow?: CreatorMinistryRow | null;
  onCloseDetails?: () => void;
}) {
  const [dismissedOverlayKey, setDismissedOverlayKey] = useState<string | null>(null);
  const selectedRow = detailRow ?? viewModel.selectedRow;
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;
  const detailKey = selectedRow ? `view:${selectedRow.id}` : "view";
  const showDetails = (Boolean(detailRow) || viewModel.showDetails) && !isDismissed(detailKey, "detail");
  const close = closeHref(viewModel);
  const closeDetails = detailRow ? onCloseDetails : () => dismissRouteOverlay(detailKey);

  function isDismissed(key: string, paramName: string) {
    return dismissedOverlayKey === key && !currentSearch.includes(`${paramName}=`);
  }

  function dismissRouteOverlay(key: string) {
    setDismissedOverlayKey(key);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", closeHref(viewModel));
    }
  }

  const verifyKey = viewModel.selectedRow ? `verify:${viewModel.selectedRow.id}` : "verify";
  const unverifyKey = viewModel.selectedRow ? `unverify:${viewModel.selectedRow.id}` : "unverify";
  const successKey = viewModel.successMessage ? `success:${viewModel.successMessage}` : "success";

  return (
    <>
      {showDetails && selectedRow ? (
        <OverlayShell closeLabel="Close Ministry detail modal" onClose={closeDetails}>
          <div className="relative z-10 w-full max-w-[560px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={close} onClose={closeDetails} className="absolute right-8 top-5" label="Close Ministry detail modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[20px] font-semibold text-white">Ministry Profile</h2>
            <CreatorDetailBody key={selectedRow.id} row={selectedRow} />
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showVerifyConfirm && viewModel.selectedRow && !isDismissed(verifyKey, "verify") ? (
        <OverlayShell closeLabel="Close verify Ministry modal" onClose={() => dismissRouteOverlay(verifyKey)}>
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[var(--color-surface-elevated)] px-10 pb-8 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(verifyKey)} className="absolute right-8 top-5" label="Close verify Ministry modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[28px] font-semibold text-white">Verify Ministry</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">
              Mark <span className="text-white">{viewModel.selectedRow.displayName}</span> as a verified Ministry? This only
              adds a trust badge on their profile — it never changes what they can already do, and never touches their
              testimonies&apos; moderation status.
            </p>
            <div className="mt-10 flex justify-end gap-4">
              <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(verifyKey)} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]" label="Cancel verification">
                Cancel
              </CloseControl>
              <form
                action={`/api/admin/creators-ministries/${viewModel.selectedRow.userId}/verify/?next=${encodeURIComponent(buildCreatorsMinistriesHref({ tab: viewModel.activeTab, success: "verify" }))}`}
                method="POST"
              >
                <button
                  type="submit"
                  className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#0cbc32] px-6 text-[16px] text-white"
                >
                  Yes, verify
                </button>
              </form>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showUnverifyConfirm && viewModel.selectedRow && !isDismissed(unverifyKey, "unverify") ? (
        <OverlayShell closeLabel="Close revoke verification modal" onClose={() => dismissRouteOverlay(unverifyKey)}>
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[var(--color-surface-elevated)] px-10 pb-8 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(unverifyKey)} className="absolute right-8 top-5" label="Close revoke verification modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[28px] font-semibold text-white">Revoke Verification</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">
              Remove the verified badge from <span className="text-white">{viewModel.selectedRow.displayName}</span>? Their
              profile, followers, and content stay exactly as they are — only the trust badge is removed.
            </p>
            <div className="mt-10 flex justify-end gap-4">
              <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(unverifyKey)} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]" label="Keep verified">
                Cancel
              </CloseControl>
              <form
                action={`/api/admin/creators-ministries/${viewModel.selectedRow.userId}/unverify/?next=${encodeURIComponent(buildCreatorsMinistriesHref({ tab: viewModel.activeTab, success: "unverify" }))}`}
                method="POST"
              >
                <button
                  type="submit"
                  className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 text-[16px] text-white"
                >
                  Yes, revoke
                </button>
              </form>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showSuccess && viewModel.successMessage && !isDismissed(successKey, "success") ? (
        <OverlayShell closeLabel="Close success modal" onClose={() => dismissRouteOverlay(successKey)}>
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[var(--color-surface-elevated)] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">{viewModel.successMessage}</p>
            <p className="mt-4 text-[18px] text-white/72">Your update has been saved.</p>
          </div>
        </OverlayShell>
      ) : null}
    </>
  );
}
