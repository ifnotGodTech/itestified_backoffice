import type { AdminOverviewViewModel } from "@/features/admin/domain/entities/overview";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";

export function AdminOverview({ viewModel }: { viewModel: AdminOverviewViewModel }) {
  const isPopulated = viewModel.phaseState === "populated";
  const tableColumns = "grid-cols-[65px_1.25fr_0.82fr_0.8fr_0.9fr_0.95fr_0.9fr]";

  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle="Overview">
      <div className="grid grid-cols-2 gap-4">
              {viewModel.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[14px] bg-[var(--color-surface-elevated)] px-[13px] py-[12px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  <p className="border-b border-white/10 pb-[13px] text-[14px] text-[var(--color-text-secondary)]">{metric.label}</p>
                  {/* On error we don't actually know this value — a "0" here would read as "confirmed
                      caught up" when it might really mean "couldn't check", so show a dash instead. */}
                  <p className="pt-[14px] text-[33px] font-medium leading-none text-[var(--color-text-primary)]">
                    {viewModel.phaseState === "error" ? "—" : metric.value}
                  </p>
                </div>
              ))}
      </div>

      <div className="mt-4 rounded-[14px] bg-[var(--color-surface-elevated)] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="px-[13px] pb-[10px] pt-[13px] text-[14px] text-[var(--color-text-secondary)]">Top Engagement for video Testimonies</div>
        <div className="border-t border-white/5">
          {isPopulated ? (
            <>
              <div className={`grid ${tableColumns} bg-[var(--color-surface-muted)] px-3 py-[7px] text-[10.5px] font-medium text-[var(--color-text-secondary)]`}>
                <span>S/N</span>
                <span>Category</span>
                <span>Type</span>
                <span>Likes</span>
                <span>Shares</span>
                <span>Comments</span>
                <span>Overall</span>
              </div>
              <div>
                {viewModel.rows.map((row) => (
                  <div
                    key={row.id}
                    className={`grid ${tableColumns} border-t border-white/10 px-3 py-[7px] text-[12.5px] text-[var(--color-text-secondary)]`}
                  >
                    <span>{row.id}</span>
                    <span>{row.category}</span>
                    <span>{row.type}</span>
                    <span>{row.likes}</span>
                    <span>{row.shares}</span>
                    <span>{row.comments}</span>
                    <span>{row.overall}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {viewModel.phaseState === "empty" ? (
            <div className="flex h-[178px] items-center justify-center text-[16px] font-semibold text-[var(--color-text-secondary)]">
              No Data here Yet
            </div>
          ) : null}
          {viewModel.phaseState === "error" ? <AdminErrorState title="Unable to load your overview" message={viewModel.errorMessage} /> : null}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
