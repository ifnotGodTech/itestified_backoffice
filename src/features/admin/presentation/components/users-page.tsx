"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UserManagementRow, UserManagementTab, UserManagementViewModel } from "@/features/admin/domain/entities/users";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { UsersOverlays } from "@/features/admin/presentation/components/users/users-overlays";
import { UsersTable } from "@/features/admin/presentation/components/users/users-table";
import { buildUsersHref } from "@/features/admin/presentation/state/users-route-state";

function usersTabHref(viewModel: UserManagementViewModel, tab: UserManagementTab) {
  return buildUsersHref({
    tab,
    q: viewModel.searchQuery,
  });
}

function usersApiHref(viewModel: UserManagementViewModel, tab: UserManagementTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/users/list?${params.toString()}`;
}

function loadingUsersViewModel(viewModel: UserManagementViewModel, tab: UserManagementTab): UserManagementViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    totalRows: 0,
    showingLabel: "Loading users...",
    showActionMenu: false,
    showDetails: false,
    showDeactivateConfirm: false,
    showReactivateConfirm: false,
  };
}

export function UsersPage({ viewModel }: { viewModel: UserManagementViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<UserManagementTab, UserManagementViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<UserManagementRow | null>(null);
  const [detailRow, setDetailRow] = useState<UserManagementRow | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function switchTab(tab: UserManagementTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    setDetailRow(null);
    window.history.pushState(null, "", usersTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingUsersViewModel(current, tab));
    try {
      const response = await fetch(usersApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load users.");
      const nextViewModel = (await response.json()) as UserManagementViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingUsersViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load user records right now. Please try again.",
        showingLabel: "Showing 0 of 0",
      }));
    }
  }

  const interactiveViewModel: UserManagementViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell} pageTitle="Users">
      {interactiveViewModel.showSuccess && interactiveViewModel.successMessage ? (
        <div className="mb-5 max-w-[1080px] rounded-[14px] border border-[#9B68D5]/20 bg-[#23162f] px-4 py-3 text-[14px] text-[#ecd5ff]">
          {interactiveViewModel.successMessage}
        </div>
      ) : null}
      <div className="space-y-5">
        <div className="flex max-w-[1080px] items-center justify-between gap-4">
          <div className="flex rounded-[10px] bg-[#262626] p-1">
            {interactiveViewModel.tabs.map((tab) => {
              const active = tab.key === interactiveViewModel.activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => switchTab(tab.key)}
                  aria-pressed={active}
                  className={`rounded-[7px] px-4 py-2 text-[13px] ${
                    active ? "bg-[#9B68D5] text-white" : "text-white/45"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Link
            href={buildUsersHref({ tab: interactiveViewModel.activeTab, q: interactiveViewModel.searchQuery })}
            className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-4 text-[14px] text-[#d7b7ff]"
          >
            Export as CSV File
          </Link>
        </div>

        <UsersTable
          viewModel={interactiveViewModel}
          onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
          onCloseMenu={() => setMenuRow(null)}
          onView={(row) => {
            setMenuRow(null);
            setDetailRow(row);
          }}
        />
      </div>

      <UsersOverlays viewModel={interactiveViewModel} detailRow={detailRow} onCloseDetails={() => setDetailRow(null)} />
    </AdminDashboardShell>
  );
}
