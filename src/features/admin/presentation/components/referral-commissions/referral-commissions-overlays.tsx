import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import type { ReferralCommissionsViewModel } from "@/features/admin/domain/entities/referral-commissions";
import { buildReferralCommissionsHref } from "@/features/admin/presentation/state/referral-commissions-route-state";

function closeHref(viewModel: ReferralCommissionsViewModel) {
  return buildReferralCommissionsHref({ tab: viewModel.activeTab, q: viewModel.searchQuery });
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

function formatAmount(amount: number, currency: string) {
  return `${currency} ${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ReferralCommissionsOverlays({ viewModel }: { viewModel: ReferralCommissionsViewModel }) {
  const [dismissedOverlayKey, setDismissedOverlayKey] = useState<string | null>(null);
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;

  function isDismissed(key: string, paramName: string) {
    return dismissedOverlayKey === key && !currentSearch.includes(`${paramName}=`);
  }

  function dismissRouteOverlay(key: string) {
    setDismissedOverlayKey(key);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", closeHref(viewModel));
    }
  }

  const markPaidKey = viewModel.selectedRow ? `markPaid:${viewModel.selectedRow.id}` : "markPaid";
  const successKey = viewModel.successMessage ? `success:${viewModel.successMessage}` : "success";

  return (
    <>
      {viewModel.showMarkPaidConfirm && viewModel.selectedRow && !isDismissed(markPaidKey, "markPaid") ? (
        <OverlayShell closeLabel="Close mark as paid modal" onClose={() => dismissRouteOverlay(markPaidKey)}>
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[var(--color-surface-elevated)] px-10 pb-8 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl
              href={closeHref(viewModel)}
              onClose={() => dismissRouteOverlay(markPaidKey)}
              className="absolute right-8 top-5"
              label="Close mark as paid modal"
            >
              <CloseX />
            </CloseControl>
            <h2 className="text-[28px] font-semibold text-white">Mark as Paid</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">
              Confirm the{" "}
              <span className="text-white">{formatAmount(viewModel.selectedRow.amount, viewModel.selectedRow.currency)}</span>{" "}
              commission owed to <span className="text-white">{viewModel.selectedRow.referrerEmail}</span> was transferred
              manually? This only updates the ledger — it does not send any money itself.
            </p>
            <div className="mt-10 flex justify-end gap-4">
              <CloseControl
                href={closeHref(viewModel)}
                onClose={() => dismissRouteOverlay(markPaidKey)}
                className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]"
                label="Cancel"
              >
                Cancel
              </CloseControl>
              <form
                action={`/api/admin/referral-commissions/${viewModel.selectedRow.id}/mark-paid/?next=${encodeURIComponent(
                  buildReferralCommissionsHref({ tab: viewModel.activeTab, success: "mark-paid" }),
                )}`}
                method="POST"
              >
                <button
                  type="submit"
                  className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#0cbc32] px-6 text-[16px] text-white"
                >
                  Yes, mark paid
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
