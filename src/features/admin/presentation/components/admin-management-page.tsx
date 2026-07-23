"use client";

import { useEffect, useState } from "react";
import type { AdminManagementRow, AdminManagementTab, AdminManagementViewModel } from "@/features/admin/domain/entities/admin-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminManagementOverlays } from "@/features/admin/presentation/components/admin-management/admin-management-overlays";
import { AdminManagementTable } from "@/features/admin/presentation/components/admin-management/admin-management-table";
import { buildAdminManagementHref } from "@/features/admin/presentation/state/admin-management-route-state";

function adminTabHref(viewModel: AdminManagementViewModel, tab: AdminManagementTab) {
  return buildAdminManagementHref({
    tab,
    q: viewModel.searchQuery || null,
  });
}

function adminApiHref(viewModel: AdminManagementViewModel, tab: AdminManagementTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/management/list?${params.toString()}`;
}

function loadingAdminViewModel(viewModel: AdminManagementViewModel, tab: AdminManagementTab): AdminManagementViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    showingLabel: "Loading admin users...",
    showMenuForId: undefined,
    showPermissionDetailsModal: false,
    showManagePermissionsModal: false,
    showAssignRoleModal: false,
    showManageRoleModal: false,
    showRenameRoleModal: false,
    showDeleteModal: false,
  };
}

export function AdminManagementPage({ viewModel }: { viewModel: AdminManagementViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [menuRow, setMenuRow] = useState<AdminManagementRow | null>(null);
  const [modalState, setModalState] = useState<{ type: "permission" | "assign"; row: AdminManagementRow } | null>(null);
  const [tabCache, setTabCache] = useState<Partial<Record<AdminManagementTab, AdminManagementViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setMenuRow(null);
    setModalState(null);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function switchTab(tab: AdminManagementTab) {
    if (tab === currentViewModel.activeTab) return;
    window.history.pushState(null, "", adminTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingAdminViewModel(current, tab));
    try {
      const response = await fetch(adminApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load admin users.");
      const nextViewModel = (await response.json()) as AdminManagementViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingAdminViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load admin management right now. Please try again.",
      }));
    }
  }

  const interactiveViewModel: AdminManagementViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? modalState?.row ?? currentViewModel.selectedRow,
    showMenuForId: menuRow?.id ?? currentViewModel.showMenuForId,
    showPermissionDetailsModal: modalState?.type === "permission" || currentViewModel.showPermissionDetailsModal,
    showAssignRoleModal: modalState?.type === "assign" || currentViewModel.showAssignRoleModal,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <AdminManagementTable
        viewModel={interactiveViewModel}
        onTabChange={switchTab}
        onOpenMenu={(row) => setMenuRow(row)}
        onCloseMenu={() => setMenuRow(null)}
        onAssignRole={(row) => {
          setMenuRow(null);
          setModalState({ type: "assign", row });
        }}
        onViewPermissions={(row) => {
          setMenuRow(null);
          setModalState({ type: "permission", row });
        }}
      />
      <AdminManagementOverlays
        viewModel={interactiveViewModel}
        onClosePermissionDetails={modalState?.type === "permission" ? () => setModalState(null) : undefined}
        onCloseAssignRole={modalState?.type === "assign" ? () => setModalState(null) : undefined}
      />
    </AdminDashboardShell>
  );
}
