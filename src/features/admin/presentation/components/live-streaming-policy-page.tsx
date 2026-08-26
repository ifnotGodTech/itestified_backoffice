import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { LiveStreamingPolicyViewModel } from "@/features/admin/domain/entities/live-streaming-policy";

function Banner({ viewModel }: { viewModel: LiveStreamingPolicyViewModel }) {
  if (viewModel.phaseState === "success") {
    return (
      <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
        {viewModel.successMessage}
      </div>
    );
  }
  if (viewModel.phaseState === "validation") {
    return (
      <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
        {viewModel.validationMessage}
      </div>
    );
  }
  return null;
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      {description ? <p className="mt-1 text-[12px] text-white/55">{description}</p> : null}
      {children}
    </div>
  );
}

export function LiveStreamingPolicyPage({ viewModel }: { viewModel: LiveStreamingPolicyViewModel }) {
  const { policy, platformUsage } = viewModel;
  const usagePercent =
    platformUsage.usedMinutes === null
      ? null
      : Math.min(100, Math.round((platformUsage.usedMinutes / Math.max(platformUsage.sharedMonthlyCeilingMinutes, 1)) * 100));

  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[860px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
              <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
            </div>
            <Link
              href="/live-broadcasts"
              className="inline-flex h-9 shrink-0 items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] font-semibold text-[#c590ff]"
            >
              Back to panel
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.phaseState === "error" ? (
            <div className="rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load this page" message={viewModel.errorMessage} />
            </div>
          ) : (
            <>
              <Banner viewModel={viewModel} />

              <Section title="This month's usage">
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-baseline justify-between text-[13px] text-white/70">
                    <span>
                      {platformUsage.usedMinutes === null
                        ? "Usage unavailable"
                        : `${platformUsage.usedMinutes.toLocaleString()} minutes used`}
                    </span>
                    <span>{platformUsage.sharedMonthlyCeilingMinutes.toLocaleString()} minute ceiling</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#9B68D5]"
                      style={{ width: `${usagePercent ?? 0}%` }}
                    />
                  </div>
                  {platformUsage.usedMinutes === null ? (
                    <p className="text-[11px] text-white/40">
                      Could not reach Agora&rsquo;s usage API right now -- this figure is best-effort and may be
                      temporarily unavailable.
                    </p>
                  ) : null}
                </div>

                <h3 className="mt-6 text-[12px] font-semibold text-white/80">Per-Ministry breakdown</h3>
                {viewModel.ministryUsageRows.length === 0 ? (
                  <p className="mt-2 text-[12px] text-white/50">No Ministry has used any streaming minutes this month.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {viewModel.ministryUsageRows.map((row) => (
                      <div
                        key={row.ministryId}
                        className="flex flex-col gap-1 rounded-[10px] border border-white/6 px-4 py-3 text-[12px] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium text-white">{row.ministryName}</span>
                        <span className="text-white/60">
                          {row.reservedMinutes.toLocaleString()} / {row.totalAllowanceMinutes.toLocaleString()} min used
                          -- {row.remainingMinutes.toLocaleString()} min remaining
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Pending overage requests" description="A Ministry that can't self-serve an overage waits here for a manual decision.">
                {viewModel.pendingApprovals.length === 0 ? (
                  <p className="mt-3 text-[12px] text-white/50">No pending requests.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {viewModel.pendingApprovals.map((request) => (
                      <div key={request.id} className="rounded-[10px] border border-white/6 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                          <span className="font-medium text-white">{request.creatorEmail}</span>
                          <span className="text-white/50">{request.createdAtLabel}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-white/70">
                          Requesting {request.requestedMinutes.toLocaleString()} extra minutes for broadcast #
                          {request.broadcastId}.
                        </p>
                        <form
                          action={`/api/admin/live-broadcasts/approval-requests/${request.id}/decide`}
                          method="POST"
                          className="mt-3 flex flex-wrap items-center gap-2"
                        >
                          <input
                            type="text"
                            name="note"
                            placeholder="Optional note"
                            className="h-9 flex-1 rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[12px] text-white outline-none focus:border-[#9B68D5]"
                          />
                          <button
                            type="submit"
                            name="approve"
                            value="true"
                            className="inline-flex h-9 items-center rounded-[8px] bg-[#0CBC32] px-4 text-[12px] font-semibold text-white"
                          >
                            Approve
                          </button>
                          <button
                            type="submit"
                            name="approve"
                            value="false"
                            className="inline-flex h-9 items-center rounded-[8px] border border-[#ef4335] px-4 text-[12px] font-semibold text-[#ef4335]"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <form action="/api/admin/live-broadcasts/policy" method="POST">
                <Section title="Broadcast policy" description="Applies immediately to every new broadcast going live -- never to one already under way.">
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 sm:col-span-2">
                      <input type="checkbox" name="is_enabled" defaultChecked={policy.isEnabled} className="h-4 w-4 accent-[#9B68D5]" />
                      <span className="text-[13px] text-white">Live broadcasting is enabled platform-wide</span>
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-white/60">Max concurrent viewers per broadcast</span>
                      <input
                        type="number"
                        name="max_concurrent_viewers"
                        min={1}
                        defaultValue={policy.maxConcurrentViewers}
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-white/60">Max duration per broadcast (minutes)</span>
                      <input
                        type="number"
                        name="max_duration_minutes"
                        min={1}
                        defaultValue={policy.maxDurationMinutes}
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-white/60">Shared monthly ceiling (participant-minutes)</span>
                      <input
                        type="number"
                        name="shared_monthly_ceiling_minutes"
                        min={1}
                        defaultValue={policy.sharedMonthlyCeilingMinutes}
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-white/60">Default Ministry monthly allowance (minutes)</span>
                      <input
                        type="number"
                        name="default_ministry_monthly_allowance_minutes"
                        min={1}
                        defaultValue={policy.defaultMinistryMonthlyAllowanceMinutes}
                        className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                      />
                    </label>
                  </div>
                  {policy.updatedAt ? (
                    <p className="mt-3 text-[11px] text-white/40">
                      Last changed {new Date(policy.updatedAt).toLocaleString()}
                      {policy.updatedByEmail ? ` by ${policy.updatedByEmail}` : ""}
                    </p>
                  ) : null}
                  <div className="mt-5 flex justify-end">
                    <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">
                      Save Policy
                    </button>
                  </div>
                </Section>
              </form>

              <Section title="Overage pricing" description="What a Ministry pays per 1,000 extra participant-minutes when self-serving past its monthly allowance.">
                {viewModel.pricingRows.length === 0 ? (
                  <p className="mt-3 text-[12px] text-white/55">No price configured for any currency yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {viewModel.pricingRows.map((row) => (
                      <div key={row.currency} className="flex items-center justify-between rounded-[10px] border border-white/6 px-4 py-3 text-[13px]">
                        <span className="font-semibold text-white">{row.currency}</span>
                        <span className="text-white/85">{row.priceLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
                <form action="/api/admin/live-broadcasts/pricing" method="POST" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    <span className="text-[11px] text-white/60">Price per 1,000 minutes (e.g. 5000 or 9.99)</span>
                    <input
                      type="text"
                      name="amount"
                      inputMode="decimal"
                      placeholder="e.g. 5000"
                      className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
                    />
                  </label>
                  <div className="flex justify-end sm:col-span-2">
                    <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">
                      Save Price
                    </button>
                  </div>
                </form>
              </Section>
            </>
          )}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
