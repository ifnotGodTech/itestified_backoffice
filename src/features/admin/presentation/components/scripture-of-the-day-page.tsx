import Link from "next/link";
import type { ScriptureOfTheDayViewModel } from "@/features/admin/domain/entities/scripture-of-the-day";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { ScriptureOfTheDayOverviewTable } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-overview-table";
import { ScriptureOfTheDayOverlays } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-overlays";
import { ScriptureScheduleBuilder } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-schedule-builder";

export function ScriptureOfTheDayPage({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle={viewModel.showScheduleBuilder ? "Schedule Scriptures" : "Scripture of the day"}>
      {viewModel.saved ? (
        <div className="mb-5 max-w-[1080px] rounded-[14px] border border-[#0cbc32]/20 bg-[#0d3215] px-4 py-3 text-[14px] text-[#d2ffd9]">
          {viewModel.isCreatingNew ? "Scripture uploaded successfully." : "Scripture updated successfully."}
        </div>
      ) : null}
      {!viewModel.showScheduleBuilder ? (
        <div className="mb-2 flex max-w-[1080px] justify-end">
          <Link
            href={viewModel.actionItems[0].href}
            className="inline-flex h-[52px] min-w-[158px] items-center justify-center gap-2 rounded-[8px] bg-[#9B68D5] px-5 text-[15px] text-white"
          >
            <span className="text-[20px] leading-none">+</span>
            <span className="leading-5 text-center">Upload New Scripture</span>
          </Link>
        </div>
      ) : null}
      <div className="max-w-[1080px]">
        {viewModel.showScheduleBuilder ? <ScriptureScheduleBuilder viewModel={viewModel} /> : <ScriptureOfTheDayOverviewTable viewModel={viewModel} />}
      </div>

      <ScriptureOfTheDayOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
