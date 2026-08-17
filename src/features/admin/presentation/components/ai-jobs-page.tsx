import Link from "next/link";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState, AdminStatusBadge } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type { AIJobRow, AIJobStatusFilter, AIJobsViewModel } from "@/features/admin/domain/entities/ai-jobs";

const filters: Array<{ key: AIJobStatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "failed", label: "Failed" },
  { key: "processing", label: "Processing" },
  { key: "pending", label: "Pending" },
  { key: "done", label: "Done" },
];

function statusToneClassName(status: AIJobRow["status"]) {
  if (status === "done") return "border-[#0cbc32]/40 bg-transparent text-[#0cbc32]";
  if (status === "failed") return "border-[#ef4335]/45 bg-transparent text-[#ef4335]";
  if (status === "processing") return "border-[#276ef1]/45 bg-transparent text-[#276ef1]";
  return "border-[#f0c400]/45 bg-transparent text-[#f0c400]";
}

function retryHref(row: AIJobRow) {
  const kindPath = row.kind === "transcription" ? "transcription" : "translation";
  return `/api/admin/ai-jobs/${kindPath}/${row.id}/retry/?next=${encodeURIComponent("/ai-jobs?success=retry")}`;
}

function filterHref(key: AIJobStatusFilter) {
  return key === "all" ? "/ai-jobs" : `/ai-jobs?status=${key}`;
}

export function AIJobsPage({ viewModel }: { viewModel: AIJobsViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[1100px] pt-6 md:pt-8">
        <div>
          <h1 className="text-[30px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[15px] text-white/50">{viewModel.pageDescription}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.key === viewModel.statusFilter;
            return (
              <Link
                key={filter.key}
                href={filterHref(filter.key)}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                    : "border-white/12 text-white/60 hover:border-white/25 hover:text-white/85"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {viewModel.successMessage ? (
          <div className="mt-5 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
            {viewModel.successMessage}
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-[14px] border border-[var(--color-border-soft)] bg-[var(--color-surface-strong)]">
          {viewModel.phaseState === "error" ? (
            <AdminErrorState title="Unable to load AI jobs" message={viewModel.errorMessage} />
          ) : viewModel.phaseState === "empty" ? (
            <div className="px-8 py-14 text-center text-[14px] text-white/55">
              No {viewModel.statusFilter === "all" ? "" : `${viewModel.statusFilter} `}transcription or translation jobs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.04em] text-white/45">
                    <th className="px-5 py-3 font-medium">Testimony</th>
                    <th className="px-5 py-3 font-medium">Job type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Error</th>
                    <th className="px-5 py-3 font-medium">Retries</th>
                    <th className="px-5 py-3 font-medium">Updated</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {viewModel.rows.map((row) => (
                    <tr key={`${row.kind}-${row.id}`} className="border-b border-white/6 last:border-b-0">
                      <td className="max-w-[240px] truncate px-5 py-4 text-white/85" title={row.testimonyTitle}>
                        {row.testimonyTitle || `Testimony #${row.testimonyId}`}
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        {row.kind === "transcription" ? "Transcription" : `Translation (${row.language ?? "—"})`}
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge label={row.status[0].toUpperCase() + row.status.slice(1)} toneClassName={statusToneClassName(row.status)} />
                      </td>
                      <td className="max-w-[260px] truncate px-5 py-4 text-white/55" title={row.errorMessage}>
                        {row.errorMessage || "—"}
                      </td>
                      <td className="px-5 py-4 text-white/55">{row.retryCount}</td>
                      <td className="px-5 py-4 text-white/55">{row.updatedAtLabel}</td>
                      <td className="px-5 py-4">
                        {row.status === "failed" ? (
                          <form action={retryHref(row)} method="post">
                            <button
                              type="submit"
                              className="rounded-[8px] border border-[var(--color-primary)] px-3 py-[6px] text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
                            >
                              Retry
                            </button>
                          </form>
                        ) : (
                          <span className="text-[12px] text-white/25">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
