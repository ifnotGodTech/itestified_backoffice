import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DonationDetail, DonationRow, DonationsViewModel } from "@/features/admin/domain/entities/donations";
import { buildDonationsHref } from "@/features/admin/presentation/state/donations-route-state";

function closeHref(viewModel: DonationsViewModel) {
  return buildDonationsHref({
    tab: viewModel.activeTab,
    q: viewModel.searchQuery,
    minAmount: viewModel.filterDraft.minAmount,
    maxAmount: viewModel.filterDraft.maxAmount,
    currency: viewModel.filterDraft.currency,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    statusFilter: viewModel.filterDraft.status,
  });
}

function OverlayShell({
  children,
  closeLabel,
  onClose,
}: {
  children: ReactNode;
  closeLabel: string;
  onClose?: () => void;
}) {
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

function DonationDetailBody({ row }: { row: DonationRow }) {
  const [detail, setDetail] = useState<DonationDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/donations/${row.id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load donation detail.");
        return response.json() as Promise<DonationDetail>;
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
    return <p className="mt-5 text-[14px] text-white/55">Loading donation detail...</p>;
  }

  if (loadState === "error" || !detail) {
    return <p className="mt-5 text-[14px] text-[#ef4335]">We could not load this donation&apos;s full detail.</p>;
  }

  return (
    <>
      <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
          <dt className="text-white/45">Donor name</dt>
          <dd className="text-white">{detail.donor}</dd>
          <dt className="text-white/45">Email</dt>
          <dd className="text-white">{detail.email}</dd>
          <dt className="text-white/45">Payment reference</dt>
          <dd className="text-white">{detail.reference}</dd>
          <dt className="text-white/45">Amount</dt>
          <dd className="text-white">{detail.amount}</dd>
          <dt className="text-white/45">Currency</dt>
          <dd className="text-white">{detail.currency}</dd>
          <dt className="text-white/45">Provider</dt>
          <dd className="text-white">{detail.provider}</dd>
          <dt className="text-white/45">Status</dt>
          <dd className="text-white">{detail.status}</dd>
          <dt className="text-white/45">Date</dt>
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

function ReversalReasonSection({
  amount,
  currency,
  donationId,
  next,
  onCancel,
  cancelHref,
}: {
  amount: string;
  currency: string;
  donationId: number;
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
          <p className="mb-2 text-[14px] text-white">Donation amount</p>
          <div className="flex h-[44px] items-center justify-between rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[14px] text-white/85">
            <span>{amount}</span>
            <span className="border-l border-white/10 pl-4">{currency}</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[14px] text-white">
            Reason for Reversal<span className="text-[#b27bff]">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this donation is being reversed"
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
          label="Cancel reversal reason"
        >
          Cancel
        </CloseControl>
        <form
          action={`/api/admin/donations/${donationId}/reverse/?reason=${encodeURIComponent(trimmedReason)}&next=${encodeURIComponent(next)}`}
          method="POST"
        >
          <button
            type="submit"
            disabled={!trimmedReason}
            className="inline-flex h-[42px] min-w-[170px] items-center justify-center rounded-[10px] bg-white/55 px-6 text-[14px] text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Reversal
          </button>
        </form>
      </div>
    </>
  );
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

export function DonationsOverlays({
  viewModel,
  detailRow,
  showFilterModal = false,
  onCloseDetails,
  onCloseFilter,
}: {
  viewModel: DonationsViewModel;
  detailRow?: DonationRow | null;
  showFilterModal?: boolean;
  onCloseDetails?: () => void;
  onCloseFilter?: () => void;
}) {
  const [dismissedOverlayKey, setDismissedOverlayKey] = useState<string | null>(null);
  const selectedRow = detailRow ?? viewModel.selectedRow;
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;
  const detailKey = selectedRow ? `view:${selectedRow.id}` : "view";
  const showDetails = (Boolean(detailRow) || viewModel.showDetails) && !isDismissed(detailKey, "view");
  const showFilter = showFilterModal || (viewModel.showFilterModal && !isDismissed("filter", "filter"));
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

  function closeFilterOverlay() {
    if (showFilterModal) {
      onCloseFilter?.();
      return;
    }
    dismissRouteOverlay("filter");
  }

  const reverseKey = viewModel.selectedRow ? `reverse:${viewModel.selectedRow.id}` : "reverse";
  const reasonKey = viewModel.selectedRow ? `reason:${viewModel.selectedRow.id}` : "reason";
  const deleteKey = viewModel.selectedRow ? `remove:${viewModel.selectedRow.id}` : "remove";
  const successKey = viewModel.successMessage ? `success:${viewModel.successMessage}` : "success";
  return (
    <>
      {showDetails && selectedRow ? (
        <OverlayShell closeLabel="Close donation detail modal" onClose={closeDetails}>
          <div className="relative z-10 w-full max-w-[620px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={close} onClose={closeDetails} className="absolute right-8 top-5" label="Close donation detail modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[20px] font-semibold text-white">Donation Detail</h2>
            <DonationDetailBody key={selectedRow.id} row={selectedRow} />
          </div>
        </OverlayShell>
      ) : null}

      {showFilter ? (
        <OverlayShell closeLabel="Close donations filter modal" onClose={closeFilterOverlay}>
          <form action="/donations" className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[20px] border border-white/15 bg-[var(--color-surface-elevated)] shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
            <input type="hidden" name="tab" value={viewModel.activeTab} />
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-[14px] font-normal text-white">Filter</h2>
              <CloseControl href={close} onClose={closeFilterOverlay} className="text-white/80 hover:text-white" label="Dismiss donations filter">
                <CloseX />
              </CloseControl>
            </div>
            <div className="px-6 py-4">
              <div className="border-b border-white/10 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Amount</p>
                  <Link href={buildDonationsHref({ tab: viewModel.activeTab, filter: true, currency: viewModel.filterDraft.currency, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, statusFilter: viewModel.filterDraft.status })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">Minimum</p>
                    <input name="minAmount" defaultValue={viewModel.filterDraft.minAmount} placeholder="e.g 500" className="h-[32px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">Maximum</p>
                    <input name="maxAmount" defaultValue={viewModel.filterDraft.maxAmount} placeholder="e.g 500000" className="h-[32px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                </div>
              </div>

              <div className="border-b border-white/10 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Currency</p>
                  <Link href={buildDonationsHref({ tab: viewModel.activeTab, filter: true, minAmount: viewModel.filterDraft.minAmount, maxAmount: viewModel.filterDraft.maxAmount, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, statusFilter: viewModel.filterDraft.status })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <input type="hidden" name="currency" value={viewModel.filterDraft.currency ?? ""} />
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[14px] text-white/76">
                  <span>{viewModel.filterDraft.currency ?? "Select"}</span>
                  <span>⌄</span>
                </div>
              </div>

              <div className="border-b border-white/10 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Status</p>
                  <Link href={buildDonationsHref({ tab: viewModel.activeTab, filter: true, minAmount: viewModel.filterDraft.minAmount, maxAmount: viewModel.filterDraft.maxAmount, currency: viewModel.filterDraft.currency, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="flex flex-wrap gap-6 text-[14px] text-white/85">
                  {(["pending", "successful", "declined"] as const).map((status) => (
                    <label key={status} className="inline-flex items-center gap-2">
                      <input type="radio" name="statusFilter" value={status} defaultChecked={viewModel.filterDraft.status === status} className="h-4 w-4 accent-[#9B68D5]" />
                      <span>{status === "successful" ? "Success" : `${status.slice(0, 1).toUpperCase()}${status.slice(1)}`}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[14px] text-white">Date Range</p>
                  <Link href={buildDonationsHref({ tab: viewModel.activeTab, filter: true, minAmount: viewModel.filterDraft.minAmount, maxAmount: viewModel.filterDraft.maxAmount, currency: viewModel.filterDraft.currency, statusFilter: viewModel.filterDraft.status })} className="text-[14px] text-[#b27bff]">
                    Clear
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">From</p>
                    <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">To</p>
                    <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-1">
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, filter: true })} className="inline-flex h-[42px] items-center rounded-[10px] border border-[#9B68D5] px-6 text-[14px] text-[#b27bff]">
                Clear All
              </Link>
              <button type="submit" className="inline-flex h-[42px] items-center rounded-[10px] bg-white/55 px-6 text-[14px] text-white/80">
                Apply
              </button>
            </div>
          </form>
        </OverlayShell>
      ) : null}

      {viewModel.showReverseConfirm && viewModel.selectedRow && !isDismissed(reverseKey, "reverse") ? (
        <OverlayShell closeLabel="Close reverse donation modal" onClose={() => dismissRouteOverlay(reverseKey)}>
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[var(--color-surface-elevated)] px-10 pb-5 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(reverseKey)} className="absolute right-8 top-5" label="Close reverse donation modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[28px] font-semibold text-white">Reverse Donation</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">Are you sure you want to make a reversal? This action cannot be undone.</p>
            <div className="mt-20 flex justify-end gap-4">
              <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(reverseKey)} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]" label="Cancel reverse donation">Cancel</CloseControl>
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, reason: viewModel.selectedRow.id })} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[16px] text-white">Yes</Link>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showReasonModal && viewModel.selectedRow && !isDismissed(reasonKey, "reason") ? (
        <OverlayShell closeLabel="Close reversal reason modal" onClose={() => dismissRouteOverlay(reasonKey)}>
          <div className="relative z-10 w-full max-w-[640px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(reasonKey)} className="absolute right-8 top-5" label="Close reversal reason modal">
              <CloseX />
            </CloseControl>
            <h2 className="text-[18px] font-semibold text-white">Reverse Donation</h2>
            <p className="mt-2 text-[14px] text-white/55">Process a refund for this donation and update the transaction record</p>
            <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
                <dt className="text-white/45">Donor name</dt>
                <dd className="text-white">{viewModel.selectedRow.donor}</dd>
                <dt className="text-white/45">Email</dt>
                <dd className="text-white">{viewModel.selectedRow.email}</dd>
                <dt className="text-white/45">Transaction ID</dt>
                <dd className="text-white">{viewModel.selectedRow.reference}</dd>
                <dt className="text-white/45">Original Amount</dt>
                <dd className="text-white">{viewModel.selectedRow.amount}</dd>
              </dl>
            </div>
            <ReversalReasonSection
              key={reasonKey}
              amount={viewModel.selectedRow.amount}
              currency={viewModel.selectedRow.currency}
              donationId={viewModel.selectedRow.id}
              next={buildDonationsHref({ tab: viewModel.activeTab, success: "reverse" })}
              onCancel={() => dismissRouteOverlay(reasonKey)}
              cancelHref={closeHref(viewModel)}
            />
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showDeleteConfirm && viewModel.selectedRow && !isDismissed(deleteKey, "remove") ? (
        <OverlayShell closeLabel="Close delete donation modal" onClose={() => dismissRouteOverlay(deleteKey)}>
          <div className="relative z-10 w-full max-w-[578px] rounded-[20px] bg-[var(--color-surface-elevated)] px-12 pb-10 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h2 className="text-[28px] font-semibold text-white">Delete Donation?</h2>
            <p className="mx-auto mt-8 max-w-[460px] text-[18px] leading-[1.4] text-white/78">Are you sure you want to delete this donation? This action cannot be undone.</p>
            <div className="mt-16 flex justify-center gap-6">
              <CloseControl href={closeHref(viewModel)} onClose={() => dismissRouteOverlay(deleteKey)} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]" label="Cancel delete donation">Cancel</CloseControl>
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, success: "delete" })} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] bg-[#ef3931] px-6 text-[16px] text-white">Yes, delete</Link>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showSuccess && viewModel.successMessage && !isDismissed(successKey, "success") ? (
        <OverlayShell closeLabel="Close donation success modal" onClose={() => dismissRouteOverlay(successKey)}>
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[var(--color-surface-elevated)] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">{viewModel.successMessage}</p>
            <p className="mt-4 text-[18px] text-white/72">{viewModel.successMessage === "Refund Successful" ? "Refund of ₦1,000 initiated" : "Your update has been saved."}</p>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showRefundConfirm && viewModel.selectedRow && !isDismissed("refund", "refund") ? (
        <OverlayShell closeLabel="Close refund modal" onClose={() => dismissRouteOverlay("refund")}>
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[var(--color-surface-elevated)] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">Refund Successful</p>
            <p className="mt-4 text-[18px] text-white/72">Refund of ₦1,000 initiated</p>
          </div>
        </OverlayShell>
      ) : null}
    </>
  );
}
