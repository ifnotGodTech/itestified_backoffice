"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TestimoniesViewModel, TestimonyRow, TestimonyTab } from "@/features/admin/domain/entities/testimonies";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { NewTestimonyToast } from "@/features/admin/presentation/components/testimonies/new-testimony-toast";
import { TestimoniesOverlays } from "@/features/admin/presentation/components/testimonies/testimonies-overlays";
import { TestimoniesTable } from "@/features/admin/presentation/components/testimonies/testimonies-table";
import { UploadVideoScreen } from "@/features/admin/presentation/components/testimonies/upload-video-screen";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";

type AdminTestimonyDetailPayload = {
  body?: string;
  video_url?: string;
  thumbnail_url?: string;
  moderation_history?: TestimonyRow["moderationHistory"];
};

const pageCardClass =
  "rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]";
const subtleButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[var(--color-primary)] px-5 text-[14px] text-[var(--color-primary)]";

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M10.5 3 5.5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityLogScreen() {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href={buildTestimoniesHref({ tab: "video" })} className="text-[var(--color-text-primary)]">
            <ChevronLeftIcon />
          </Link>
          <h2 className="text-[22px] font-semibold leading-[1.25] text-[var(--color-text-primary)] md:text-[28px]">Activity Log for Text Testimonies</h2>
        </div>
        <Link href={buildTestimoniesHref({ tab: "video", screen: "activity" })} className={`${subtleButtonClass} w-fit`}>
          Export as CSV File
        </Link>
      </div>

      <div className={`${pageCardClass} mt-8 overflow-hidden md:mt-10`}>
        <div className="px-5 py-6 text-[18px] font-medium text-[var(--color-text-primary)]">Activity Log</div>
        <div className="flex flex-col gap-3 px-5 pb-5 md:flex-row md:items-center md:justify-end">
          <div className="h-[36px] w-full rounded-[8px] bg-[var(--color-surface-panel)] px-4 py-2 text-[12px] text-[var(--color-text-muted)] md:w-[290px]">Search by name</div>
          <div className="inline-flex h-[36px] min-w-[78px] items-center justify-center rounded-[8px] border border-[var(--color-primary)] px-4 text-[14px] text-[var(--color-primary)]">Filter</div>
        </div>
        <div className="grid grid-cols-[70px_1.2fr_1.15fr_1fr_0.9fr] bg-[var(--color-surface-muted)] px-4 py-[11px] text-[10px] font-medium text-[var(--color-text-secondary)]">
          <span>S/N</span>
          <span>Admin Name</span>
          <span>Timestamp</span>
          <span>Testimony</span>
          <span>Action</span>
        </div>
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="grid grid-cols-[70px_1.2fr_1.15fr_1fr_0.9fr] border-t border-white/10 px-4 py-4 text-[14px] text-[var(--color-text-secondary)]">
            <span>{id}</span>
            <div>
              <p>Ore Ore</p>
              <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">{id === 2 ? "Content Manager" : "Super Admin"}</p>
            </div>
            <span>08/08/2024, 2:30:00 PM</span>
            <div>
              <p>God Is Good</p>
              <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">TEXT-001</p>
            </div>
            <span>{id === 2 ? "Rejected" : id === 3 ? "Deleted" : "Approved"}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-10 text-[12px] text-[var(--color-text-muted)]">
          <span>Showing 1-4 of 4</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/20 px-4 py-2 text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[var(--color-primary)] px-5 py-2 text-[var(--color-primary)]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function tabHref(viewModel: TestimoniesViewModel, tab: TestimonyTab) {
  return buildTestimoniesHref({
    tab,
    videoStatus: tab === "video" ? viewModel.activeVideoStatus : null,
    engagement: tab === "video" ? viewModel.activeVideoEngagement : null,
    q: viewModel.searchQuery,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    category: viewModel.filterDraft.category,
    source: tab === "video" ? viewModel.filterDraft.source : undefined,
    statusFilter: tab === "text" ? viewModel.filterDraft.status : undefined,
  });
}

function tabListApiHref(viewModel: TestimoniesViewModel, tab: TestimonyTab) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (tab === "video") {
    params.set("videoStatus", viewModel.activeVideoStatus);
    params.set("engagement", viewModel.activeVideoEngagement);
    if (viewModel.filterDraft.source) params.set("source", viewModel.filterDraft.source);
  }
  if (tab === "text" && viewModel.filterDraft.status) params.set("statusFilter", viewModel.filterDraft.status);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  if (viewModel.filterDraft.from) params.set("from", viewModel.filterDraft.from);
  if (viewModel.filterDraft.to) params.set("to", viewModel.filterDraft.to);
  if (viewModel.filterDraft.category) params.set("category", viewModel.filterDraft.category);
  return `/api/admin/testimonies/list?${params.toString()}`;
}

function loadingViewModel(viewModel: TestimoniesViewModel, tab: TestimonyTab): TestimoniesViewModel {
  return {
    ...viewModel,
    activeTab: tab,
    activeVideoScreen: "list",
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    totalRows: 0,
    showingLabel: "Loading testimonies...",
    showActionMenu: false,
    showDetails: false,
    showFilterModal: false,
  };
}

function mergeDetailPayload(row: TestimonyRow, payload: AdminTestimonyDetailPayload): TestimonyRow {
  if (row.kind === "text") {
    return {
      ...row,
      body: payload.body ?? row.body,
      moderationHistory: payload.moderation_history ?? row.moderationHistory,
    };
  }

  return {
    ...row,
    videoUrl: payload.video_url ?? row.videoUrl,
    thumbnailSrc: payload.thumbnail_url ?? row.thumbnailSrc,
    moderationHistory: payload.moderation_history ?? row.moderationHistory,
  };
}

export function TestimoniesPage({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [tabCache, setTabCache] = useState<Partial<Record<TestimonyTab, TestimoniesViewModel>>>({
    [viewModel.activeTab]: viewModel,
  });
  const showsDedicatedVideoHeading = currentViewModel.activeTab === "video" && currentViewModel.activeVideoScreen !== "list";
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [detailRow, setDetailRow] = useState<TestimonyRow | null>(null);
  useEffect(() => {
    setCurrentViewModel(viewModel);
    setTabCache({ [viewModel.activeTab]: viewModel });
  }, [viewModel]);

  useEffect(() => {
    if (!viewModel.showSuccess) return;
    setShowFilterModal(false);
    setDetailRow(null);
  }, [viewModel.showSuccess]);

  async function switchTab(tab: TestimonyTab) {
    if (tab === currentViewModel.activeTab) return;
    setShowFilterModal(false);
    setDetailRow(null);
    const href = tabHref(currentViewModel, tab);
    window.history.pushState(null, "", href);

    const cached = tabCache[tab];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }

    setCurrentViewModel((current) => loadingViewModel(current, tab));
    try {
      const response = await fetch(tabListApiHref(currentViewModel, tab));
      if (!response.ok) throw new Error("Unable to load testimonies.");
      const nextViewModel = (await response.json()) as TestimoniesViewModel;
      setTabCache((current) => ({ ...current, [tab]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingViewModel(current, tab),
        phaseState: "error",
        errorMessage: "We could not load testimonies right now. Please try again.",
        showingLabel: "Showing 0 of 0",
      }));
    }
  }

  async function openDetails(row: TestimonyRow) {
    try {
      const response = await fetch(`/api/admin/testimonies/${row.id}`);
      if (!response.ok) throw new Error("Unable to load testimony details.");
      const payload = (await response.json()) as AdminTestimonyDetailPayload;
      setDetailRow(mergeDetailPayload(row, payload));
    } catch {
      setDetailRow(row);
    }
  }

  return (
    <AdminDashboardShell viewModel={currentViewModel.shell} pageTitle={showsDedicatedVideoHeading ? undefined : "Testimonies"}>
      <NewTestimonyToast />
      {currentViewModel.activeTab === "video" && currentViewModel.activeVideoScreen === "upload" ? <UploadVideoScreen categories={currentViewModel.categories} /> : null}
      {currentViewModel.activeTab === "video" && currentViewModel.activeVideoScreen === "activity" ? <ActivityLogScreen /> : null}
      {!(currentViewModel.activeTab === "video" && currentViewModel.activeVideoScreen !== "list") ? (
        <TestimoniesTable
          viewModel={currentViewModel}
          onOpenFilter={() => setShowFilterModal(true)}
          onOpenDetails={openDetails}
          onTabChange={switchTab}
        />
      ) : null}
      <TestimoniesOverlays
        viewModel={currentViewModel}
        showFilterModal={showFilterModal}
        onCloseFilterModal={() => setShowFilterModal(false)}
        detailRow={detailRow}
        onCloseDetailModal={() => setDetailRow(null)}
        onActionComplete={() => {
          setShowFilterModal(false);
          setDetailRow(null);
        }}
      />
    </AdminDashboardShell>
  );
}
