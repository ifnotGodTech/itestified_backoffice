import Link from "next/link";
import type { ReactNode } from "react";
import type { DonationsViewModel } from "@/features/admin/domain/entities/donations";
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
}: {
  children: ReactNode;
  closeLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <div className="absolute inset-0" aria-label={closeLabel} />
      {children}
    </div>
  );
}

function CloseX() {
  return <span className="text-[36px] leading-none text-white/90">×</span>;
}

export function DonationsOverlays({ viewModel }: { viewModel: DonationsViewModel }) {
  return (
    <>
      {viewModel.showFilterModal ? (
        <OverlayShell closeLabel="Close donations filter modal">
          <form action="/donations" className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[20px] border border-white/15 bg-[#1d1d1d] shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
            <input type="hidden" name="tab" value={viewModel.activeTab} />
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-[14px] font-normal text-white">Filter</h2>
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
                    <input name="minAmount" defaultValue={viewModel.filterDraft.minAmount} placeholder="e.g 500" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">Maximum</p>
                    <input name="maxAmount" defaultValue={viewModel.filterDraft.maxAmount} placeholder="e.g 500000" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
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
                <div className="flex h-[40px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[14px] text-white/76">
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
                    <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] text-white/45">To</p>
                    <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="h-[32px] w-full rounded-[8px] bg-[#2a2a2a] px-4 text-[12px] text-white/80 outline-none placeholder:text-white/28" />
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
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close donations filter modal" />
        </OverlayShell>
      ) : null}

      {viewModel.showReverseConfirm && viewModel.selectedRow ? (
        <OverlayShell closeLabel="Close reverse donation modal">
          <div className="relative z-10 w-full max-w-[513px] rounded-[20px] bg-[#1f1f1f] px-10 pb-5 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Link href={closeHref(viewModel)} className="absolute right-8 top-5" aria-label="Close reverse donation modal">
              <CloseX />
            </Link>
            <h2 className="text-[28px] font-semibold text-white">Reverse Donation</h2>
            <p className="mx-auto mt-6 max-w-[420px] text-[18px] leading-[1.4] text-white/78">Are you sure you want to make a reversal? This action cannot be undone.</p>
            <div className="mt-20 flex justify-end gap-4">
              <Link href={closeHref(viewModel)} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]">Cancel</Link>
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, reason: viewModel.selectedRow.id })} className="inline-flex h-[54px] min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[16px] text-white">Yes</Link>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showReasonModal && viewModel.selectedRow ? (
        <OverlayShell closeLabel="Close reversal reason modal">
          <div className="relative z-10 w-full max-w-[640px] rounded-[20px] bg-[#1f1f1f] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Link href={closeHref(viewModel)} className="absolute right-8 top-5" aria-label="Close reversal reason modal">
              <CloseX />
            </Link>
            <h2 className="text-[18px] font-semibold text-white">Reverse Donation</h2>
            <p className="mt-2 text-[14px] text-white/55">Process a refund for this donation and update the transaction record</p>
            <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-4 text-[14px]">
                <dt className="text-white/45">Donor name</dt>
                <dd className="text-white">Akinlabi Jonah</dd>
                <dt className="text-white/45">Email</dt>
                <dd className="text-white">example@email.com</dd>
                <dt className="text-white/45">Transaction ID</dt>
                <dd className="text-white">KG08964FH89</dd>
                <dt className="text-white/45">Original Amount</dt>
                <dd className="text-white">₦20,000</dd>
              </dl>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[14px] text-white">Refund amount<span className="text-[#b27bff]">*</span></p>
                <div className="flex h-[44px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[14px] text-white/85">
                  <span>₦ 00.00</span>
                  <span className="border-l border-white/10 pl-4">NGN ⌄</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[14px] text-white">Reason for Reversal<span className="text-[#b27bff]">*</span></p>
                <div className="flex h-[44px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-4 text-[14px] text-white/75">
                  <span>Select reason for reversal</span>
                  <span>⌄</span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Link href={closeHref(viewModel)} className="inline-flex h-[42px] min-w-[170px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[14px] text-[#9B68D5]">Cancel</Link>
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, success: "refund" })} className="inline-flex h-[42px] min-w-[170px] items-center justify-center rounded-[10px] bg-white/55 px-6 text-[14px] text-white/70">Confirm Refund</Link>
            </div>
          </div>
        </OverlayShell>
      ) : null}

      {viewModel.showDeleteConfirm && viewModel.selectedRow ? (
        <OverlayShell closeLabel="Close delete donation modal">
          <div className="relative z-10 w-full max-w-[578px] rounded-[20px] bg-[#1f1f1f] px-12 pb-10 pt-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h2 className="text-[28px] font-semibold text-white">Delete Donation?</h2>
            <p className="mx-auto mt-8 max-w-[460px] text-[18px] leading-[1.4] text-white/78">Are you sure you want to delete this donation? This action cannot be undone.</p>
            <div className="mt-16 flex justify-center gap-6">
              <Link href={closeHref(viewModel)} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[16px] text-[#9B68D5]">Cancel</Link>
              <Link href={buildDonationsHref({ tab: viewModel.activeTab, success: "delete" })} className="inline-flex h-[54px] min-w-[176px] items-center justify-center rounded-[10px] bg-[#ef3931] px-6 text-[16px] text-white">Yes, delete</Link>
            </div>
          </div>
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete donation modal" />
        </OverlayShell>
      ) : null}

      {viewModel.showSuccess && viewModel.successMessage ? (
        <OverlayShell closeLabel="Close donation success modal">
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[#1f1f1f] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">{viewModel.successMessage}</p>
            <p className="mt-4 text-[18px] text-white/72">{viewModel.successMessage === "Refund Successful" ? "Refund of ₦1,000 initiated" : "Your update has been saved."}</p>
          </div>
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close donation success modal" />
        </OverlayShell>
      ) : null}

      {viewModel.showRefundConfirm && viewModel.selectedRow ? (
        <OverlayShell closeLabel="Close refund modal">
          <div className="relative z-10 w-full max-w-[390px] rounded-[20px] bg-[#1f1f1f] px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
            <p className="mt-10 text-[28px] font-semibold leading-[1.2] text-white">Refund Successful</p>
            <p className="mt-4 text-[18px] text-white/72">Refund of ₦1,000 initiated</p>
          </div>
          <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close refund modal" />
        </OverlayShell>
      ) : null}
    </>
  );
}
