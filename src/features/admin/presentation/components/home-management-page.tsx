"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomeManagementRow, HomeManagementTab, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { HomeManagementContentTable } from "@/features/admin/presentation/components/home-management/home-management-table";
import { HomeManagementOverlays } from "@/features/admin/presentation/components/home-management/home-management-overlays";
import { buildHomeManagementHref } from "@/features/admin/presentation/state/home-management-route-state";

function countLabelForTab(activeTab: HomeManagementViewModel["activeTab"]) {
  return activeTab === "pictures" ? "Number of Pictures" : "Number of Testimonies";
}

function homeTabHref(viewModel: HomeManagementViewModel, tab: HomeManagementTab) {
  return buildHomeManagementHref({
    tab,
    rule: viewModel.displayRule,
    count: viewModel.testimonyCount,
  });
}

function homeApiHref(viewModel: HomeManagementViewModel, tab: HomeManagementTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("rule", viewModel.displayRule);
  params.set("count", String(viewModel.testimonyCount));
  return `/api/admin/home-management/list?${params.toString()}`;
}

function loadingHomeViewModel(viewModel: HomeManagementViewModel, tab: HomeManagementTab): HomeManagementViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    availableCount: 0,
    showActionMenu: false,
    showDetails: false,
    showRemoveConfirm: false,
  };
}

export function HomeManagementPage({ viewModel }: { viewModel: HomeManagementViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<HomeManagementTab, HomeManagementViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const [menuRow, setMenuRow] = useState<HomeManagementRow | null>(null);
  const [detailRow, setDetailRow] = useState<HomeManagementRow | null>(null);

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
        fetch(homeApiHref(currentViewModel, tab), { signal: controller.signal })
          .then((response) => (response.ok ? response.json() : null))
          .then((nextViewModel: HomeManagementViewModel | null) => ({ tab, nextViewModel })),
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

  async function switchTab(tab: HomeManagementTab) {
    if (tab === currentViewModel.activeTab) return;
    setMenuRow(null);
    setDetailRow(null);
    window.history.pushState(null, "", homeTabHref(currentViewModel, tab));
    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingHomeViewModel(current, tab));
    try {
      const response = await fetch(homeApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load homepage content.");
      const nextViewModel = (await response.json()) as HomeManagementViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingHomeViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load homepage content right now. Please try again.",
      }));
    }
  }

  const interactiveViewModel: HomeManagementViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
  };

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell} pageTitle="Home Page Management">
      <div className="space-y-5">
        <div className="flex gap-2">
          {interactiveViewModel.tabs.map((tab) => {
            const active = tab.key === interactiveViewModel.activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                aria-pressed={active}
                className={`rounded-[7px] px-4 py-2 text-[13px] ${
                  active ? "bg-[#9B68D5] text-white" : "bg-[#1f1f1f] text-white/45"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form action="/home-management" className="rounded-[18px] bg-[#171717] px-4 py-4">
          <input type="hidden" name="tab" value={interactiveViewModel.activeTab} />
          {interactiveViewModel.phaseState !== "populated" ? <input type="hidden" name="state" value={interactiveViewModel.phaseState} /> : null}
          <div className="grid grid-cols-[1.25fr_1.6fr_160px] gap-4">
            <label className="space-y-2">
              <span className="text-[16px] font-medium text-white/90">Display Rule</span>
              <span className="relative flex h-[44px] items-center rounded-[8px] bg-[#1f1f1f]">
                <select
                  name="rule"
                  defaultValue={interactiveViewModel.displayRule}
                  className="h-full w-full appearance-none rounded-[8px] bg-transparent px-4 pr-10 text-[15px] text-white/75 outline-none"
                  aria-label="Display Rule"
                >
                  {interactiveViewModel.displayRuleOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#1f1f1f] text-white">
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 text-white/55">▾</span>
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-[16px] font-medium text-white/90">{countLabelForTab(interactiveViewModel.activeTab)}</span>
              <input
                type="number"
                name="count"
                min={1}
                max={interactiveViewModel.availableCount}
                defaultValue={interactiveViewModel.testimonyCount}
                className="h-[44px] w-full rounded-[8px] bg-[#1f1f1f] px-4 text-[15px] text-white/75 outline-none"
                aria-label={countLabelForTab(interactiveViewModel.activeTab)}
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="h-[40px] w-full rounded-[8px] bg-[#8f56d8] text-[18px] font-medium text-white">
                Apply
              </button>
            </div>
          </div>
        </form>

        <HomeManagementContentTable viewModel={interactiveViewModel} onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))} />
      </div>

      <HomeManagementOverlays
        viewModel={interactiveViewModel}
        detailRow={detailRow}
        onCloseMenu={() => setMenuRow(null)}
        onView={(row) => {
          setMenuRow(null);
          setDetailRow(row);
        }}
        onCloseDetails={() => setDetailRow(null)}
      />
    </AdminDashboardShell>
  );
}
