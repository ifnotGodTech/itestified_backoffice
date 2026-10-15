"use client";

import { useEffect, useState } from "react";
import type { HomeManagementRow, HomeManagementViewModel } from "@/features/admin/domain/entities/home-management";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { HomeManagementContentTable } from "@/features/admin/presentation/components/home-management/home-management-table";
import { HomeManagementOverlays } from "@/features/admin/presentation/components/home-management/home-management-overlays";
import { HomeManagementAddPictureModal } from "@/features/admin/presentation/components/home-management/home-management-add-picture-modal";
import { HomeManagementApplyConfirmModal } from "@/features/admin/presentation/components/home-management/home-management-apply-confirm-modal";
import { sortFeaturedPicturesByRule } from "@/features/admin/data/services/get-home-management-view-model";

/** Phase 35: the featured pictures woven into the app's Home feed -- all that
 * remains of this page once the featured testimonies and the section order
 * were retired. */
export function HomeManagementPage({ viewModel }: { viewModel: HomeManagementViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [menuRow, setMenuRow] = useState<HomeManagementRow | null>(null);
  const [detailRow, setDetailRow] = useState<HomeManagementRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPendingId, setAddPendingId] = useState<number | null>(null);
  const [curationBusy, setCurationBusy] = useState(false);
  const [curationError, setCurationError] = useState<string | null>(null);
  const [pendingApply, setPendingApply] = useState<{
    pictureIds: number[];
    removedTitles: string[];
    keptCount: number;
  } | null>(null);

  useEffect(() => {
    setCurrentViewModel(viewModel);
  }, [viewModel]);

  async function submitCuration(featuredPictureIds: number[]) {
    setCurationBusy(true);
    setCurationError(null);
    try {
      const response = await fetch("/api/admin/content/home-curation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ featuredPictureIds, count: currentViewModel.testimonyCount }),
      });
      if (!response.ok) throw new Error("Unable to update home page curation.");
      setCurrentViewModel((await response.json()) as HomeManagementViewModel);
      setShowAddModal(false);
    } catch {
      setCurationError("We could not update the home page right now. Please try again.");
    } finally {
      setCurationBusy(false);
      setAddPendingId(null);
    }
  }

  function moveFeaturedPicture(id: number, direction: "up" | "down") {
    const order = currentViewModel.featuredPictureOrder;
    const index = order.findIndex((item) => item.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= order.length) return;
    const reordered = [...order];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    submitCuration(reordered.map((item) => item.id));
  }

  function addPicture(id: number) {
    setAddPendingId(id);
    submitCuration([...currentViewModel.featuredPictureOrder.map((item) => item.id), id]);
  }

  // "Apply" keeps the newest N featured pictures, rather than only filtering
  // the admin's own table view -- items beyond the count are dropped from
  // what the app shows. Because that's a real, hard-to-reverse deletion (not
  // a display filter), this only computes the plan; nothing is submitted
  // until the admin confirms exactly what's about to be removed.
  function planApply(count: number) {
    const all = currentViewModel.featuredPictureOrder;
    const kept = sortFeaturedPicturesByRule(all).slice(0, count);
    const keptIds = new Set(kept.map((item) => item.id));
    return {
      pictureIds: kept.map((item) => item.id),
      removedTitles: all.filter((item) => !keptIds.has(item.id)).map((item) => item.title),
      keptCount: kept.length,
    };
  }

  function requestApply(count: number) {
    const plan = planApply(count);
    if (plan.removedTitles.length === 0) {
      // Nothing would be removed, so there's nothing to confirm.
      submitCuration(plan.pictureIds);
      return;
    }
    setPendingApply(plan);
  }

  function confirmApply() {
    if (!pendingApply) return;
    submitCuration(pendingApply.pictureIds);
    setPendingApply(null);
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
        {curationError ? <p className="text-[13px] text-[#ef4335]">{curationError}</p> : null}

        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] text-white/70">The pictures that appear between testimonies in the app&apos;s Home feed.</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-[38px] items-center justify-center gap-1 rounded-[8px] bg-[#9B68D5] px-4 text-[13px] text-white"
          >
            + Add Picture
          </button>
        </div>

        <form
          key={`${interactiveViewModel.displayRule}-${interactiveViewModel.testimonyCount}`}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const count = Number(formData.get("count") ?? interactiveViewModel.testimonyCount) || interactiveViewModel.testimonyCount;
            requestApply(count);
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
              <span className="text-[16px] font-medium text-white/90">Number of Pictures</span>
              <input
                type="number"
                name="count"
                min={1}
                max={interactiveViewModel.availableCount}
                defaultValue={interactiveViewModel.testimonyCount}
                className="h-[44px] w-full rounded-[8px] bg-[var(--color-surface-elevated)] px-4 text-[15px] text-white/75 outline-none"
                aria-label="Number of Pictures"
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
          onMoveFeaturedPicture={moveFeaturedPicture}
        />
      </div>

      {showAddModal ? (
        <HomeManagementAddPictureModal
          availablePictures={interactiveViewModel.availablePictures}
          onAdd={addPicture}
          onClose={() => setShowAddModal(false)}
          pendingId={addPendingId}
        />
      ) : null}

      {pendingApply ? (
        <HomeManagementApplyConfirmModal
          removedTitles={pendingApply.removedTitles}
          keptCount={pendingApply.keptCount}
          busy={curationBusy}
          onConfirm={confirmApply}
          onCancel={() => setPendingApply(null)}
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
