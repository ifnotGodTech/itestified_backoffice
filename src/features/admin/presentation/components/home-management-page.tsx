"use client";

import { useEffect, useState } from "react";
import type {
  HomeManagementDisplayRule,
  HomeManagementFeaturedTestimony,
  HomeManagementRow,
  HomeManagementSectionKey,
  HomeManagementTab,
  HomeManagementViewModel,
} from "@/features/admin/domain/entities/home-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { HomeManagementContentTable } from "@/features/admin/presentation/components/home-management/home-management-table";
import { HomeManagementOverlays } from "@/features/admin/presentation/components/home-management/home-management-overlays";
import { HomeManagementSectionOrderCard } from "@/features/admin/presentation/components/home-management/home-management-section-order";
import { HomeManagementAddTestimonyModal } from "@/features/admin/presentation/components/home-management/home-management-add-testimony-modal";
import { HomeManagementAddPictureModal } from "@/features/admin/presentation/components/home-management/home-management-add-picture-modal";
import { sortFeaturedPicturesByRule, sortFeaturedTestimoniesByRule } from "@/features/admin/data/services/get-home-management-view-model";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPendingId, setAddPendingId] = useState<number | null>(null);
  const [curationBusy, setCurationBusy] = useState(false);
  const [curationError, setCurationError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  async function submitCuration(
    featuredTestimonyIds: number[],
    featuredPictureIds: number[],
    sectionOrder: HomeManagementSectionKey[],
  ) {
    setCurationBusy(true);
    setCurationError(null);
    try {
      const response = await fetch("/api/admin/content/home-curation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          featuredTestimonyIds,
          featuredPictureIds,
          sectionOrder,
          tab: currentViewModel.activeTab,
          rule: currentViewModel.displayRule,
          count: currentViewModel.testimonyCount,
        }),
      });
      if (!response.ok) throw new Error("Unable to update home page curation.");
      const nextViewModel = (await response.json()) as HomeManagementViewModel;
      // featuredOrder/featuredPictureOrder/sectionOrder are global curation
      // state shared by every tab's view model, not tab-scoped -- a curation
      // change here makes every OTHER cached tab stale. Drop them instead of
      // patching just the active one, or switching to a stale tab and
      // curating from there would silently resubmit pre-change data and
      // wipe out what changed here (e.g. adding a picture from a Pictures
      // tab cached before testimonies were added would blow away those
      // testimonies).
      setTabCache({ [nextViewModel.activeTab]: nextViewModel });
      setCurrentViewModel(nextViewModel);
      setShowAddModal(false);
    } catch {
      setCurationError("We could not update the home page right now. Please try again.");
    } finally {
      setCurationBusy(false);
      setAddPendingId(null);
    }
  }

  function moveFeatured(id: number, direction: "up" | "down") {
    const order = currentViewModel.featuredOrder;
    const index = order.findIndex((item) => item.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= order.length) return;
    const reordered = [...order];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    submitCuration(
      reordered.map((item) => item.id),
      currentViewModel.featuredPictureOrder.map((item) => item.id),
      currentViewModel.sectionOrder.map((section) => section.key),
    );
  }

  function moveFeaturedPicture(id: number, direction: "up" | "down") {
    const order = currentViewModel.featuredPictureOrder;
    const index = order.findIndex((item) => item.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= order.length) return;
    const reordered = [...order];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    submitCuration(
      currentViewModel.featuredOrder.map((item) => item.id),
      reordered.map((item) => item.id),
      currentViewModel.sectionOrder.map((section) => section.key),
    );
  }

  function moveSection(key: HomeManagementSectionKey, direction: "up" | "down") {
    const order = currentViewModel.sectionOrder;
    const index = order.findIndex((item) => item.key === key);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= order.length) return;
    const reordered = [...order];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    submitCuration(
      currentViewModel.featuredOrder.map((item) => item.id),
      currentViewModel.featuredPictureOrder.map((item) => item.id),
      reordered.map((section) => section.key),
    );
  }

  function addTestimony(id: number) {
    setAddPendingId(id);
    submitCuration(
      [...currentViewModel.featuredOrder.map((item) => item.id), id],
      currentViewModel.featuredPictureOrder.map((item) => item.id),
      currentViewModel.sectionOrder.map((section) => section.key),
    );
  }

  function addPicture(id: number) {
    setAddPendingId(id);
    submitCuration(
      currentViewModel.featuredOrder.map((item) => item.id),
      [...currentViewModel.featuredPictureOrder.map((item) => item.id), id],
      currentViewModel.sectionOrder.map((section) => section.key),
    );
  }

  // "Apply" sorts + caps the currently-featured set for the active tab's
  // type by the chosen rule, rather than only filtering the admin's own
  // table view -- items beyond the count are dropped from what mobile sees.
  function applyDisplayRule(rule: HomeManagementDisplayRule, count: number) {
    if (currentViewModel.activeTab === "pictures") {
      const kept = sortFeaturedPicturesByRule(currentViewModel.featuredPictureOrder).slice(0, count);
      submitCuration(
        currentViewModel.featuredOrder.map((item) => item.id),
        kept.map((item) => item.id),
        currentViewModel.sectionOrder.map((section) => section.key),
      );
      return;
    }
    const targetType = currentViewModel.activeTab;
    const kept = sortFeaturedTestimoniesByRule(
      currentViewModel.featuredOrder.filter((item) => item.testimonyType === targetType),
      rule,
    ).slice(0, count);
    let keptIndex = 0;
    const merged = currentViewModel.featuredOrder
      .map((item): HomeManagementFeaturedTestimony | null => {
        if (item.testimonyType !== targetType) return item;
        const replacement = kept[keptIndex] ?? null;
        keptIndex += 1;
        return replacement;
      })
      .filter((item): item is HomeManagementFeaturedTestimony => item !== null);
    submitCuration(
      merged.map((item) => item.id),
      currentViewModel.featuredPictureOrder.map((item) => item.id),
      currentViewModel.sectionOrder.map((section) => section.key),
    );
  }

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
        <HomeManagementSectionOrderCard sectionOrder={interactiveViewModel.sectionOrder} onMove={moveSection} disabled={curationBusy} />

        {curationError ? <p className="text-[13px] text-[#ef4335]">{curationError}</p> : null}

        <div className="flex items-center justify-between gap-2">
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
                    active ? "bg-[#9B68D5] text-white" : "bg-[var(--color-surface-elevated)] text-white/45"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-[38px] items-center justify-center gap-1 rounded-[8px] bg-[#9B68D5] px-4 text-[13px] text-white"
          >
            {interactiveViewModel.activeTab === "pictures" ? "+ Add Picture" : "+ Add Testimony"}
          </button>
        </div>

        <form
          key={`${interactiveViewModel.activeTab}-${interactiveViewModel.displayRule}-${interactiveViewModel.testimonyCount}`}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const rule = String(formData.get("rule") ?? interactiveViewModel.displayRule) as HomeManagementDisplayRule;
            const count = Number(formData.get("count") ?? interactiveViewModel.testimonyCount) || interactiveViewModel.testimonyCount;
            applyDisplayRule(rule, count);
          }}
          className={`rounded-[18px] bg-[var(--color-surface-elevated)] px-4 py-4 ${
            interactiveViewModel.phaseState === "loading" || curationBusy ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <div className="grid grid-cols-[1.25fr_1.6fr_160px] gap-4">
            <label className="space-y-2">
              <span className="text-[16px] font-medium text-white/90">Display Rule</span>
              <span className="relative flex h-[44px] items-center rounded-[8px] bg-[var(--color-surface-elevated)]">
                <select
                  name="rule"
                  defaultValue={interactiveViewModel.displayRule}
                  className="h-full w-full appearance-none rounded-[8px] bg-transparent px-4 pr-10 text-[15px] text-white/75 outline-none"
                  aria-label="Display Rule"
                >
                  {interactiveViewModel.displayRuleOptions.map((option) => (
                    <option key={option} value={option} className="bg-[var(--color-surface-elevated)] text-white">
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
                className="h-[44px] w-full rounded-[8px] bg-[var(--color-surface-elevated)] px-4 text-[15px] text-white/75 outline-none"
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

        <HomeManagementContentTable
          viewModel={interactiveViewModel}
          onOpenMenu={(row) => setMenuRow((current) => (current?.id === row.id ? null : row))}
          onMoveFeatured={moveFeatured}
          onMoveFeaturedPicture={moveFeaturedPicture}
        />
      </div>

      {showAddModal && interactiveViewModel.activeTab === "pictures" ? (
        <HomeManagementAddPictureModal
          availablePictures={interactiveViewModel.availablePictures}
          onAdd={addPicture}
          onClose={() => setShowAddModal(false)}
          pendingId={addPendingId}
        />
      ) : null}

      {showAddModal && interactiveViewModel.activeTab !== "pictures" ? (
        <HomeManagementAddTestimonyModal
          activeTab={interactiveViewModel.activeTab}
          availableTestimonies={interactiveViewModel.availableTestimonies}
          onAdd={addTestimony}
          onClose={() => setShowAddModal(false)}
          pendingId={addPendingId}
        />
      ) : null}

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
