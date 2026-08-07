import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { SubscriptionDetail, SubscriptionRow, SubscriptionsViewModel } from "@/features/admin/domain/entities/subscriptions";
import { buildSubscriptionsHref } from "@/features/admin/presentation/state/subscriptions-route-state";

function closeHref(viewModel: SubscriptionsViewModel) {
  return buildSubscriptionsHref({ tab: viewModel.activeTab, q: viewModel.searchQuery });
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

function SubscriptionDetailBody({ row }: { row: SubscriptionRow }) {
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/subscriptions/${row.id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load subscription detail.");
        return response.json() as Promise<SubscriptionDetail>;
      })
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [row.id]);

  if (loadState === "loading") {
    return <p className="mt-5 text-[14px] text-white/55">Loading subscription detail...</p>;
  }

  if (loadState === "error" || !detail) {
    return <p className="mt-5 text-[14px] text-[#ef4335]">We could not load this subscription&apos;s full detail.</p>;
  }

  return (
    <>
      <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
          <dt className="text-white/45">Subscriber name</dt>
          <dd className="text-white">{detail.subscriber}</dd>
          <dt className="text-white/45">Email</dt>
          <dd className="text-white">{detail.email}</dd>
          <dt className="text-white/45">Payment reference</dt>
          <dd className="text-white">{detail.reference}</dd>
          <dt className="text-white/45">Amount</dt>
          <dd className="text-white">{detail.amount} / month</dd>
          <dt className="text-white/45">Currency</dt>
          <dd className="text-white">{detail.currency}</dd>
          <dt className="text-white/45">Renews on</dt>
          <dd className="text-white">{detail.cancelAtPeriodEnd ? `${detail.renewsOn} (ends, not renewing)` : detail.renewsOn}</dd>
          <dt className="text-white/45">Status</dt>
          <dd className="text-white">{detail.status}</dd>
          <dt className="text-white/45">Started</dt>
          <dd className="text-white">{detail.date}</dd>
        </dl>
      </div>
      <div className="mt-5">
        <h3 className="text-[14px] font-semibold text-white">Status history</h3>
        {detail.statusHistory.length === 0 ? (
          <p className="mt-2 text-[13px] text-white/45">No status changes recorded yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {detail.statusHistory.map((entry) => (
              <li key={entry.id} className="rounded-[8px] border border-white/10 px-3 py-2 text-[13px] text-white/75">
                <span className="text-white">
                  {entry.fromStatus || "—"} → {entry.toStatus}
                </span>
                <span className="ml-2 text-white/45">{entry.date}</span>
                {entry.reason ? <p className="mt-1 text-white/55">{entry.reason}</p> : null}
                {entry.actorEmail ? <p className="mt-1 text-white/35">by {entry.actorEmail}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function CancelReasonSection({
  amount,
  currency,
  subscriptionId,
  next,
  onCancel,
  cancelHref,
}: {
  amount: string;
  currency: string;
  subscriptionId: number;
  next: string;
  onCancel?: () => void;
  cancelHref: string;
}) {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[14px] text-white">Subscription amount</p>
          <div className="flex h-[44px] items-center justify-between rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[14px] text-white/85">
            <span>{amount}</span>
            <span className="border-l border-white/10 pl-4">{currency}</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[14px] text-white">
            Reason for cancellation<span className="text-[#b27bff]">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this subscription is being canceled"
            rows={1}
            className="w-full resize-none rounded-[8px] bg-[var(--color-surface-muted)] px-4 py-3 text-[14px] text-white/85 outline-none placeholder:text-white/28"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <CloseControl
          href={cancelHref}
          onClose={onCancel}
          className="inline-flex h-[42px] min-w-[170px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[14px] text-[#9B68D5]"
          label="Cancel cancellation reason"
        >
          Cancel
        </CloseControl>
        <form
          action={`/api/admin/subscriptions/${subscriptionId}/cancel/?reason=${encodeURIComponent(trimmedReason)}&next=${encodeURIComponent(next)}`}
          method="POST"
        >
          <button
            type="submit"
            disabled={!trimmedReason}
            className="inline-flex h-[42px] min-w-[170px] items-center justify-center rounded-[10px] bg-white/55 px-6 text-[14px] text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Cancellation
          </button>
        </form>
      </div>
    </>
  );
}

export function SubscriptionsOverlays({
  viewModel,
  detailRow,
  onCloseDetails,
}: {
  viewModel: SubscriptionsViewModel;
  detailRow?: SubscriptionRow | null;
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

  const cancelKey = viewModel.selectedRow ? `cancel:${viewModel.selectedRow.id}` : "cancel";
  const reasonKey = viewModel.selectedRow ? `reason:${viewModel.selectedRow.id}` : "reason";
  const successKey = viewModel.successMessage ? `success:${viewModel.successMessage}` : "success";

  return (
    <>
      {showDetails && selectedRow ? (
        <OverlayShell closeLabel="Close subscription detail modal" onClose={closeDetails}>
          <div className="relative z-10 w-full max-w-[620px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={close} onClose={closeDetails} className="absolute right-8 top-5" label="Close subscription detail modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[20px] font-semibold text-white">Subscription Detail</h2>
            <SubscriptionDetailBody key={selectedRow.id} row={selectedRow} />
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showCancelConfirm && viewModel.selectedRow && !isDismissed(cancelKey, "cancel") ? (
        <OverlayShell closeLabel="Close cancel subscription modal" onClose={() => dismissRouteOverlay(cancelKey)}>
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[var(--color-surface-elevated)] px-10 pb-5 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(cancelKey)} className="absolute right-8 top-5" label="Close cancel subscription modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[28px] font-semibold text-white">Cancel Subscription</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">
              Are you sure you want to cancel this subscription? Active/past-due access continues until the current period
              ends; a pending subscription cancels immediately. This action cannot be undone.
            </p>
            <div className="mt-20 flex justify-end gap-4">
              <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(cancelKey)} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]" label="Keep subscription">
                Cancel
              </CloseControl>
              <Link
                href={buildSubscriptionsHref({ tab: viewModel.activeTab, reason: viewModel.selectedRow.id })}
                className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[16px] text-white"
              >
                Yes
              </Link>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showReasonModal && viewModel.selectedRow && !isDismissed(reasonKey, "reason") ? (
        <OverlayShell closeLabel="Close cancellation reason modal" onClose={() => dismissRouteOverlay(reasonKey)}>
          <div className="relative z-10 w-full max-w-[640px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(reasonKey)} className="absolute right-8 top-5" label="Close cancellation reason modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[18px] font-semibold text-white">Cancel Subscription</h2>
            <p className="mt-2 text-[14px] text-white/55">Cancel this subscription on the subscriber&apos;s behalf and record why.</p>
            <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
                <dt className="text-white/45">Subscriber name</dt>
                <dd className="text-white">{viewModel.selectedRow.subscriber}</dd>
                <dt className="text-white/45">Email</dt>
                <dd className="text-white">{viewModel.selectedRow.email}</dd>
                <dt className="text-white/45">Reference</dt>
                <dd className="text-white">{viewModel.selectedRow.reference}</dd>
                <dt className="text-white/45">Amount</dt>
                <dd className="text-white">{viewModel.selectedRow.amount}</dd>
              </dl>
            </div>
            <CancelReasonSection
              key={reasonKey}
              amount={viewModel.selectedRow.amount}
              currency={viewModel.selectedRow.currency}
              subscriptionId={viewModel.selectedRow.id}
              next={buildSubscriptionsHref({ tab: viewModel.activeTab, success: "cancel" })}
              onCancel={() => dismissRouteOverlay(reasonKey)}
              cancelHref={closeHref(viewModel)}
            />
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showSuccess && viewModel.successMessage && !isDismissed(successKey, "success") ? (
        <OverlayShell closeLabel="Close subscription success modal" onClose={() => dismissRouteOverlay(successKey)}>
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
