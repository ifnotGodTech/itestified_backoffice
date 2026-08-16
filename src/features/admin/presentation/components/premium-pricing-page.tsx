import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { PremiumPricingViewModel } from "@/features/admin/domain/entities/premium-pricing";

export function PremiumPricingPage({ viewModel }: { viewModel: PremiumPricingViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[720px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
        </div>

        <div className="bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.phaseState === "error" ? (
            <div className="mb-4 rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load pricing" message={viewModel.errorMessage} />
            </div>
          ) : null}
          {viewModel.phaseState === "success" ? (
            <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
              {viewModel.successMessage}
            </div>
          ) : null}
          {viewModel.phaseState === "validation" ? (
            <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
              {viewModel.validationMessage}
            </div>
          ) : null}
          {viewModel.phaseState === "gateway_error" ? (
            <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
              Flutterwave rejected this price. Check the amount and try again.
            </div>
          ) : null}

          <div className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <h2 className="text-[14px] font-semibold text-white">Current pricing</h2>
            {viewModel.rows.length === 0 ? (
              <p className="mt-3 text-[13px] text-white/55">
                No price configured for any currency yet — Premium can&rsquo;t be subscribed to until you set one below.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {viewModel.rows.map((row) => (
                  <div
                    key={row.currency}
                    className="flex flex-col gap-1 rounded-[12px] border border-white/6 bg-[var(--color-surface-elevated)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="text-[15px] font-semibold text-white">{row.currency}</span>
                      <span className="ml-3 text-[15px] text-white/85">{row.amountLabel}</span>
                    </div>
                    <p className="text-[12px] text-white/48">
                      {row.updatedAt
                        ? `Last set ${new Date(row.updatedAt).toLocaleString()}${row.updatedByEmail ? ` by ${row.updatedByEmail}` : ""}`
                        : "Not set yet"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            action="/api/admin/subscriptions/pricing"
            method="POST"
            className="mt-6 rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <h2 className="text-[14px] font-semibold text-white">Set a price</h2>
            <p className="mt-1 text-[12px] text-white/55">
              Creates a brand-new Flutterwave plan for this currency and switches new subscribers to it. Existing
              subscribers on this currency keep paying their original price until they naturally re-subscribe.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] text-white/60">Currency (3-letter code)</span>
                <input
                  type="text"
                  name="currency"
                  maxLength={3}
                  placeholder="e.g. NGN or USD"
                  className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] uppercase text-white outline-none focus:border-[#9B68D5]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] text-white/60">Amount (e.g. 3000 or 4.99)</span>
                <input
                  type="text"
                  name="amount"
                  inputMode="decimal"
                  placeholder="e.g. 3000"
                  className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Link href="/subscriptions" className="inline-flex h-10 items-center rounded-[8px] border border-[#9B68D5] px-5 text-[12px] text-[#c590ff]">
                Back to Subscriptions
              </Link>
              <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">
                Save Price
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
