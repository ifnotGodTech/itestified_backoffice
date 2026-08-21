"use client";

import { useEffect, useState } from "react";
import type {
  CreatorMinistryRow,
  CreatorMinistryTab,
  CreatorsMinistriesViewModel,
} from "@/features/admin/domain/entities/creators-ministries";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { CreatorsMinistriesOverlays } from "@/features/admin/presentation/components/creators-ministries/creators-ministries-overlays";
import { CreatorsMinistriesTable } from "@/features/admin/presentation/components/creators-ministries/creators-ministries-table";
import { buildCreatorsMinistriesHref } from "@/features/admin/presentation/state/creators-ministries-route-state";

function creatorsMinistriesTabHref(viewModel: CreatorsMinistriesViewModel, tab: CreatorMinistryTab) {
  return buildCreatorsMinistriesHref({ tab, q: viewModel.searchQuery });
}

function creatorsMinistriesApiHref(viewModel: CreatorsMinistriesViewModel, tab: CreatorMinistryTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/creators-ministries/list?${params.toString()}`;
}

function loadingCreatorsMinistriesViewModel(
  viewModel: CreatorsMinistriesViewModel,
  tab: CreatorMinistryTab,
): CreatorsMinistriesViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    showingLabel: "Loading Ministry profiles...",
    showActionMenu: false,
    showDetails: false,
  };
}

export function CreatorsMinistriesPage({ viewModel }: { viewModel: CreatorsMinistriesViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<CreatorMinistryTab, CreatorsMinistriesViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<CreatorMinistryRow | null>(null);
  const [detailRow, setDetailRow] = useState<CreatorMinistryRow | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function switchTab(tab: CreatorMinistryTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    setDetailRow(null);
    window.history.pushState(null, "", creatorsMinistriesTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingCreatorsMinistriesViewModel(current, tab));
    try {
      const response = await fetch(creatorsMinistriesApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load Ministry profiles.");
      const nextViewModel = (await response.json()) as CreatorsMinistriesViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingCreatorsMinistriesViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load Ministry profiles right now. Please try again.",
        showingLabel: "Showing 0 of 0",
        page: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
    }
  }

  const interactiveViewModel: CreatorsMinistriesViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <CreatorsMinistriesTable
        viewModel={interactiveViewModel}
        onTabChange={switchTab}
        onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
        onCloseMenu={() => setMenuRow(null)}
        onView={(row) => {
          setMenuRow(null);
          setDetailRow(row);
        }}
      />
      <CreatorsMinistriesOverlays
        viewModel={interactiveViewModel}
        detailRow={detailRow}
        onCloseDetails={() => setDetailRow(null)}
      />
    </AdminDashboardShell>
  );
}
