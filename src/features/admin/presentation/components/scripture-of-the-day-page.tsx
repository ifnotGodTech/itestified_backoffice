"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ScriptureOfTheDayViewModel, ScriptureRow, ScriptureTab } from "@/features/admin/domain/entities/scripture-of-the-day";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { ScriptureOfTheDayOverviewTable } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-overview-table";
import { ScriptureOfTheDayOverlays } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-overlays";
import { ScriptureScheduleBuilder } from "@/features/admin/presentation/components/scripture-of-the-day/scripture-of-the-day-schedule-builder";
import { buildScriptureOfTheDayHref } from "@/features/admin/presentation/state/scripture-of-the-day-route-state";

function scriptureTabHref(viewModel: ScriptureOfTheDayViewModel, tab: ScriptureTab) {
  return buildScriptureOfTheDayHref({
    tab,
    q: viewModel.searchQuery,
    count: viewModel.scheduleEntryCount,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    statusFilter: viewModel.filterDraft.status,
  });
}

function scriptureApiHref(viewModel: ScriptureOfTheDayViewModel, tab: ScriptureTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  params.set("count", String(viewModel.scheduleEntryCount));
  if (viewModel.filterDraft.from) params.set("from", viewModel.filterDraft.from);
  if (viewModel.filterDraft.to) params.set("to", viewModel.filterDraft.to);
  if (viewModel.filterDraft.status) params.set("status", viewModel.filterDraft.status);
  return `/api/admin/scripture-of-the-day/list?${params.toString()}`;
}

function loadingScriptureViewModel(viewModel: ScriptureOfTheDayViewModel, tab: ScriptureTab): ScriptureOfTheDayViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    rows: [],
    totalRows: 0,
    selectedRow: null,
    showingLabel: "Loading scriptures...",
    showActionMenu: false,
    showDetails: false,
    showFilterModal: false,
  };
}

export function ScriptureOfTheDayPage({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [menuRow, setMenuRow] = useState<ScriptureRow | null>(null);
  const [detailRow, setDetailRow] = useState<ScriptureRow | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tabCache, setTabCache] = useState<Partial<Record<ScriptureTab, ScriptureOfTheDayViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setMenuRow(null);
    setDetailRow(null);
    setShowFilterModal(false);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  useEffect(() => {
    if (currentViewModel.showScheduleBuilder) return;
    const inactiveTabs = currentViewModel.tabs
      .map((tab) => tab.key)
      .filter((tab) => tab !== currentViewModel.activeTab && !tabCache[tab]);
    if (inactiveTabs.length === 0 || typeof fetch !== "function") return;
    const controller = new AbortController();
    Promise.all(
      inactiveTabs.map((tab) =>
        fetch(scriptureApiHref(currentViewModel, tab), { signal: controller.signal })
          .then((response) => (response.ok ? response.json() : null))
          .then((nextViewModel: ScriptureOfTheDayViewModel | null) => ({ tab, nextViewModel })),
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

  async function switchTab(tab: ScriptureTab) {
    if (tab === currentViewModel.activeTab) return;
    window.history.pushState(null, "", scriptureTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingScriptureViewModel(current, tab));
    try {
      const response = await fetch(scriptureApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load scriptures.");
      const nextViewModel = (await response.json()) as ScriptureOfTheDayViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => loadingScriptureViewModel(current, tab));
    }
  }

  const interactiveViewModel: ScriptureOfTheDayViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
    showFilterModal: showFilterModal || currentViewModel.showFilterModal,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell} pageTitle={interactiveViewModel.showScheduleBuilder ? "Schedule Scriptures" : "Scripture of the day"}>
      {interactiveViewModel.saved ? (
        <div className="mb-5 max-w-[1080px] rounded-[14px] border border-[#0cbc32]/20 bg-[#0d3215] px-4 py-3 text-[14px] text-[#d2ffd9]">
          {interactiveViewModel.isCreatingNew ? "Scripture uploaded successfully." : "Scripture updated successfully."}
        </div>
      ) : null}
      {!interactiveViewModel.showScheduleBuilder ? (
        <div className="mb-2 flex max-w-[1080px] justify-end">
          <Link
            href={interactiveViewModel.actionItems[0].href}
            className="inline-flex h-[52px] min-w-[158px] items-center justify-center gap-2 rounded-[8px] bg-[#9B68D5] px-5 text-[15px] text-white"
          >
            <span className="text-[20px] leading-none">+</span>
            <span className="leading-5 text-center">Upload New Scripture</span>
          </Link>
        </div>
      ) : null}
      <div className="max-w-[1080px]">
        {interactiveViewModel.showScheduleBuilder ? (
          <ScriptureScheduleBuilder viewModel={interactiveViewModel} />
        ) : (
          <ScriptureOfTheDayOverviewTable
            viewModel={interactiveViewModel}
            onTabChange={switchTab}
            onOpenMenu={(row) => setMenuRow(row)}
            onCloseMenu={() => setMenuRow(null)}
            onView={(row) => {
              setMenuRow(null);
              setDetailRow(row);
            }}
            onOpenFilter={() => setShowFilterModal(true)}
          />
        )}
      </div>

      <ScriptureOfTheDayOverlays
        viewModel={interactiveViewModel}
        detailRow={detailRow}
        showFilterModal={showFilterModal}
        onCloseDetails={() => setDetailRow(null)}
        onCloseFilter={() => setShowFilterModal(false)}
      />
    </AdminDashboardShell>
  );
}
