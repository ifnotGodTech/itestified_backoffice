import type { AdminOverviewViewModel } from "@/features/admin/domain/entities/overview";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";

export function AdminOverview({ viewModel }: { viewModel: AdminOverviewViewModel }) {
  const tableColumns = viewModel.empty
    ? "grid-cols-[1.2fr_1fr_0.95fr_0.95fr_1.05fr_0.95fr]"
    : "grid-cols-[65px_1.25fr_0.82fr_0.8fr_0.9fr_0.95fr_0.9fr]";

  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle="Overview">
      <div className="grid grid-cols-2 gap-4">
              {viewModel.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[14px] bg-[#1b1b1b] px-[13px] py-[12px] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  <p className="border-b border-white/10 pb-[13px] text-[14px] text-[#d8d8d8]">{metric.label}</p>
                  <p className="pt-[14px] text-[33px] font-medium leading-none text-[#f5f5f5]">{metric.value}</p>
                </div>
              ))}
      </div>

      <div className="mt-4 rounded-[14px] bg-[#1b1b1b] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="px-[13px] pb-[10px] pt-[13px] text-[14px] text-[#d8d8d8]">Top Engagement for video Testimonies</div>
        <div className="border-t border-white/5">
          <div className={`grid ${tableColumns} bg-[#2a2a2a] px-3 py-[7px] text-[10.5px] font-medium text-[#cfcfcf]`}>
            {!viewModel.empty ? <span>S/N</span> : null}
            <span>Category</span>
            <span>Type</span>
            <span>Likes</span>
            <span>Shares</span>
            <span>Comments</span>
            <span>Overall</span>
          </div>
          {viewModel.empty ? (
            <div className="flex h-[178px] items-center justify-center text-[16px] font-semibold text-[#d7d7d7]">
              No Data here Yet
            </div>
          ) : (
            <div>
              {viewModel.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[65px_1.25fr_0.82fr_0.8fr_0.9fr_0.95fr_0.9fr] border-t border-white/10 px-3 py-[7px] text-[12.5px] text-[#d6d6d6]"
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
          )}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
