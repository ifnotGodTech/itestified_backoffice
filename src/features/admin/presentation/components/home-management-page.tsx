import Link from "next/link";
import type { HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { HomeManagementContentTable } from "@/features/admin/presentation/components/home-management/home-management-table";
import { HomeManagementOverlays } from "@/features/admin/presentation/components/home-management/home-management-overlays";
import { buildHomeManagementHref } from "@/features/admin/presentation/state/home-management-route-state";

function countLabelForTab(activeTab: HomeManagementViewModel["activeTab"]) {
  return activeTab === "pictures" ? "Number of Pictures" : "Number of Testimonies";
}

export function HomeManagementPage({ viewModel }: { viewModel: HomeManagementViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle="Home Page Management">
      <div className="space-y-5">
        <div className="flex gap-2">
          {viewModel.tabs.map((tab) => {
            const href = buildHomeManagementHref({
              tab: tab.key,
              rule: viewModel.displayRule,
              count: viewModel.testimonyCount,
              state: viewModel.phaseState === "populated" ? null : viewModel.phaseState,
            });
            const active = tab.key === viewModel.activeTab;

            return (
              <Link
                key={tab.key}
                href={href}
                className={`rounded-[7px] px-4 py-2 text-[13px] ${
                  active ? "bg-[#9B68D5] text-white" : "bg-[#1f1f1f] text-white/45"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form action="/home-management" className="rounded-[18px] bg-[#171717] px-4 py-4">
          <input type="hidden" name="tab" value={viewModel.activeTab} />
          {viewModel.phaseState !== "populated" ? <input type="hidden" name="state" value={viewModel.phaseState} /> : null}
          <div className="grid grid-cols-[1.25fr_1.6fr_160px] gap-4">
            <label className="space-y-2">
              <span className="text-[16px] font-medium text-white/90">Display Rule</span>
              <span className="relative flex h-[44px] items-center rounded-[8px] bg-[#1f1f1f]">
                <select
                  name="rule"
                  defaultValue={viewModel.displayRule}
                  className="h-full w-full appearance-none rounded-[8px] bg-transparent px-4 pr-10 text-[15px] text-white/75 outline-none"
                  aria-label="Display Rule"
                >
                  {viewModel.displayRuleOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#1f1f1f] text-white">
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 text-white/55">▾</span>
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-[16px] font-medium text-white/90">{countLabelForTab(viewModel.activeTab)}</span>
              <input
                type="number"
                name="count"
                min={1}
                max={viewModel.availableCount}
                defaultValue={viewModel.testimonyCount}
                className="h-[44px] w-full rounded-[8px] bg-[#1f1f1f] px-4 text-[15px] text-white/75 outline-none"
                aria-label={countLabelForTab(viewModel.activeTab)}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="h-[40px] w-full rounded-[8px] bg-[#8f56d8] text-[18px] font-medium text-white">
                Apply
              </button>
            </div>
          </div>
        </form>

        <HomeManagementContentTable viewModel={viewModel} />
      </div>

      <HomeManagementOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
