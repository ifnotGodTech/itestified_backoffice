import Link from "next/link";
import type { UserManagementViewModel } from "@/features/admin/domain/entities/users";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { UsersOverlays } from "@/features/admin/presentation/components/users/users-overlays";
import { UsersTable } from "@/features/admin/presentation/components/users/users-table";
import { buildUsersHref } from "@/features/admin/presentation/state/users-route-state";

export function UsersPage({ viewModel }: { viewModel: UserManagementViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell} pageTitle="Users">
      {viewModel.showSuccess && viewModel.successMessage ? (
        <div className="mb-5 max-w-[1080px] rounded-[14px] border border-[#9B68D5]/20 bg-[#23162f] px-4 py-3 text-[14px] text-[#ecd5ff]">
          {viewModel.successMessage}
        </div>
      ) : null}
      <div className="space-y-5">
        <div className="flex max-w-[1080px] items-center justify-between gap-4">
          <div className="flex rounded-[10px] bg-[#262626] p-1">
            {viewModel.tabs.map((tab) => {
              const href = buildUsersHref({
                tab: tab.key,
                state: viewModel.phaseState === "populated" ? null : viewModel.phaseState,
                q: viewModel.searchQuery,
              });
              const active = tab.key === viewModel.activeTab;

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={`rounded-[7px] px-4 py-2 text-[13px] ${
                    active ? "bg-[#9B68D5] text-white" : "text-white/45"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <Link
            href={buildUsersHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
            className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-4 text-[14px] text-[#d7b7ff]"
          >
            Export as CSV File
          </Link>
        </div>

        <UsersTable viewModel={viewModel} />
      </div>

      <UsersOverlays viewModel={viewModel} />
    </AdminDashboardShell>
  );
}
