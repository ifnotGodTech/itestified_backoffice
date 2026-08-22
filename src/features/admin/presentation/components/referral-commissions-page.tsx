"use client";

import { useEffect, useState } from "react";
import type {
  ReferralCommissionRow,
  ReferralCommissionTab,
  ReferralCommissionsViewModel,
} from "@/features/admin/domain/entities/referral-commissions";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { ReferralCommissionsOverlays } from "@/features/admin/presentation/components/referral-commissions/referral-commissions-overlays";
import { ReferralCommissionsTable } from "@/features/admin/presentation/components/referral-commissions/referral-commissions-table";
import { buildReferralCommissionsHref } from "@/features/admin/presentation/state/referral-commissions-route-state";

function commissionsTabHref(viewModel: ReferralCommissionsViewModel, tab: ReferralCommissionTab) {
  return buildReferralCommissionsHref({ tab, q: viewModel.searchQuery });
}

function commissionsApiHref(viewModel: ReferralCommissionsViewModel, tab: ReferralCommissionTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/referral-commissions/list?${params.toString()}`;
}

function loadingCommissionsViewModel(
  viewModel: ReferralCommissionsViewModel,
  tab: ReferralCommissionTab,
): ReferralCommissionsViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    showingLabel: "Loading commission ledger...",
    showActionMenu: false,
  };
}

export function ReferralCommissionsPage({ viewModel }: { viewModel: ReferralCommissionsViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<ReferralCommissionTab, ReferralCommissionsViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<ReferralCommissionRow | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function switchTab(tab: ReferralCommissionTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    window.history.pushState(null, "", commissionsTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingCommissionsViewModel(current, tab));
    try {
      const response = await fetch(commissionsApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load the commission ledger.");
      const nextViewModel = (await response.json()) as ReferralCommissionsViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingCommissionsViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load the commission ledger right now. Please try again.",
        showingLabel: "Showing 0 of 0",
        page: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
    }
  }

  const interactiveViewModel: ReferralCommissionsViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <ReferralCommissionsTable
        viewModel={interactiveViewModel}
        onTabChange={switchTab}
        onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
        onCloseMenu={() => setMenuRow(null)}
      />
      <ReferralCommissionsOverlays viewModel={interactiveViewModel} />
    </AdminDashboardShell>
  );
}
