"use client";

import { useEffect, useState } from "react";
import type { SubscriptionRow, SubscriptionTab, SubscriptionsViewModel } from "@/features/admin/domain/entities/subscriptions";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { SubscriptionsOverlays } from "@/features/admin/presentation/components/subscriptions/subscriptions-overlays";
import { SubscriptionsTable } from "@/features/admin/presentation/components/subscriptions/subscriptions-table";
import { buildSubscriptionsHref } from "@/features/admin/presentation/state/subscriptions-route-state";

function subscriptionsTabHref(viewModel: SubscriptionsViewModel, tab: SubscriptionTab) {
  return buildSubscriptionsHref({ tab, q: viewModel.searchQuery });
}

function subscriptionsApiHref(viewModel: SubscriptionsViewModel, tab: SubscriptionTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/subscriptions/list?${params.toString()}`;
}

function loadingSubscriptionsViewModel(viewModel: SubscriptionsViewModel, tab: SubscriptionTab): SubscriptionsViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    showingLabel: "Loading subscriptions...",
    showActionMenu: false,
    showDetails: false,
  };
}

export function SubscriptionsPage({ viewModel }: { viewModel: SubscriptionsViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<SubscriptionTab, SubscriptionsViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<SubscriptionRow | null>(null);
  const [detailRow, setDetailRow] = useState<SubscriptionRow | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function switchTab(tab: SubscriptionTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    setDetailRow(null);
    window.history.pushState(null, "", subscriptionsTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingSubscriptionsViewModel(current, tab));
    try {
      const response = await fetch(subscriptionsApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load subscriptions.");
      const nextViewModel = (await response.json()) as SubscriptionsViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingSubscriptionsViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load subscriptions right now. Please try again.",
        showingLabel: "Showing 0 of 0",
        page: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
    }
  }

  const interactiveViewModel: SubscriptionsViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <SubscriptionsTable
        viewModel={interactiveViewModel}
        onTabChange={switchTab}
        onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
        onCloseMenu={() => setMenuRow(null)}
        onView={(row) => {
          setMenuRow(null);
          setDetailRow(row);
        }}
      />
      <SubscriptionsOverlays viewModel={interactiveViewModel} detailRow={detailRow} onCloseDetails={() => setDetailRow(null)} />
    </AdminDashboardShell>
  );
}
