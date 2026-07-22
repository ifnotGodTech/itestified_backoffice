"use client";

import { useEffect, useState } from "react";
import type { DonationRow, DonationTab, DonationsViewModel } from "@/features/admin/domain/entities/donations";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { DonationsOverlays } from "@/features/admin/presentation/components/donations/donations-overlays";
import { DonationsTable } from "@/features/admin/presentation/components/donations/donations-table";
import { buildDonationsHref } from "@/features/admin/presentation/state/donations-route-state";

function donationsTabHref(viewModel: DonationsViewModel, tab: DonationTab) {
  return buildDonationsHref({
    tab,
    month: viewModel.selectedMonth,
    q: viewModel.searchQuery,
    minAmount: viewModel.filterDraft.minAmount,
    maxAmount: viewModel.filterDraft.maxAmount,
    currency: viewModel.filterDraft.currency,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    statusFilter: tab === "all" ? viewModel.filterDraft.status : undefined,
  });
}

function donationsApiHref(viewModel: DonationsViewModel, tab: DonationTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.selectedMonth) params.set("month", viewModel.selectedMonth);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  if (viewModel.filterDraft.minAmount) params.set("minAmount", viewModel.filterDraft.minAmount);
  if (viewModel.filterDraft.maxAmount) params.set("maxAmount", viewModel.filterDraft.maxAmount);
  if (viewModel.filterDraft.currency) params.set("currency", viewModel.filterDraft.currency);
  if (viewModel.filterDraft.from) params.set("from", viewModel.filterDraft.from);
  if (viewModel.filterDraft.to) params.set("to", viewModel.filterDraft.to);
  if (tab === "all" && viewModel.filterDraft.status) params.set("statusFilter", viewModel.filterDraft.status);
  return `/api/admin/donations/list?${params.toString()}`;
}

function loadingDonationsViewModel(viewModel: DonationsViewModel, tab: DonationTab): DonationsViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    showingLabel: "Loading donations...",
    showActionMenu: false,
    showDetails: false,
    showMonthMenu: false,
    showFilterModal: false,
  };
}

export function DonationsPage({ viewModel }: { viewModel: DonationsViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<DonationTab, DonationsViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<DonationRow | null>(null);
  const [detailRow, setDetailRow] = useState<DonationRow | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  useEffect(() => {
    const inactiveTabs = currentViewModel.tabs
      .map((tab) => tab.key)
      .filter((tab) => tab !== currentViewModel.activeTab && !tabCache[tab]);
    if (inactiveTabs.length === 0 || typeof fetch !== "function") return;
    const controller = new AbortController();
    Promise.all(
      inactiveTabs.map((tab) =>
        fetch(donationsApiHref(currentViewModel, tab), { signal: controller.signal })
          .then((response) => (response.ok ? response.json() : null))
          .then((nextViewModel: DonationsViewModel | null) => ({ tab, nextViewModel })),
      ),
    )
      .then((results) => {
        setTabCache((current) => {
          const next = { ...current };
          for (const result of results) {
            if (result.nextViewModel) next[result.tab] = result.nextViewModel;
          }
          return next;
        });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [currentViewModel, tabCache]);

  async function switchTab(tab: DonationTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    setDetailRow(null);
    setShowFilterModal(false);
    window.history.pushState(null, "", donationsTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingDonationsViewModel(current, tab));
    try {
      const response = await fetch(donationsApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load donations.");
      const nextViewModel = (await response.json()) as DonationsViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingDonationsViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load donations right now. Please try again.",
        showingLabel: "Page 1 of 1",
      }));
    }
  }

  const interactiveViewModel: DonationsViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
    showFilterModal: showFilterModal || currentViewModel.showFilterModal,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell}>
      <DonationsTable
        viewModel={interactiveViewModel}
        onTabChange={switchTab}
        onOpenFilter={() => setShowFilterModal(true)}
        onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
        onCloseMenu={() => setMenuRow(null)}
        onView={(row) => {
          setMenuRow(null);
          setDetailRow(row);
        }}
      />
      <DonationsOverlays
        viewModel={interactiveViewModel}
        detailRow={detailRow}
        showFilterModal={showFilterModal}
        onCloseDetails={() => setDetailRow(null)}
        onCloseFilter={() => setShowFilterModal(false)}
      />
    </AdminDashboardShell>
  );
}
