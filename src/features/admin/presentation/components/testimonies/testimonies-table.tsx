"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  TestimoniesViewModel,
  TestimonyRow,
  TestimonyStatus,
  TestimonyTab,
  TextTestimonyRow,
  VideoTestimonyRow,
} from "@/features/admin/domain/entities/testimonies";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.7 12.7 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h13l-5 5.5v4.2l-3 1.3V11L3.5 5.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function RowMenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="15.5" r="1.5" />
    </svg>
  );
}

function StatusPill({ status }: { status: TestimonyStatus }) {
  const cls =
    status === "Approved" || status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : status === "Rejected"
        ? "border-[#ef4335]/25 bg-[#321313] text-[#ef4335]"
        : status === "Scheduled" || status === "Pending"
          ? "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"
          : "border-white/20 bg-[#252525] text-white/70";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] leading-none ${cls}`}>{status}</span>;
}

function TestimoniesEmpty() {
  return (
    <div className="px-8 py-16 text-center">
      <p className="text-[18px] font-medium text-white/90">No Data here Yet</p>
    </div>
  );
}

function TestimoniesLoading({ video = false }: { video?: boolean }) {
  const columns = video ? 12 : 9;
  const gridCls = video
    ? "grid grid-cols-[56px_100px_1fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr_0.8fr_110px_54px] items-center"
    : "grid grid-cols-[64px_1.1fr_1fr_1fr_0.8fr_0.9fr_0.8fr_110px_54px] items-center";

  return (
    <div className="space-y-3 px-3 py-4">
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <div key={rowIndex} className={gridCls}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <span key={`${rowIndex}-${cellIndex}`} className="mx-2 h-6 animate-pulse rounded bg-white/8" />
          ))}
        </div>
      ))}
    </div>
  );
}

function TestimoniesError({ message }: { message?: string }) {
  return (
    <div className="px-8 py-14">
      <div className="rounded-[18px] border border-[#ef4335]/30 bg-[#2a1615] px-6 py-6">
        <h3 className="text-[20px] font-semibold text-white">Unable to load testimonies</h3>
        <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-white/70">
          {message ?? "An unexpected error occurred while loading this section."}
        </p>
      </div>
    </div>
  );
}

function TextActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: TextTestimonyRow;
  viewModel: TestimoniesViewModel;
  onView: (row: TestimonyRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 2;
  const canArchive = row.status === "Approved" || row.status === "Scheduled";

  return (
    <div className={`absolute right-0 z-50 min-w-[118px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <button type="button" onClick={() => onView(row)} className="block w-full border-b border-white/10 px-4 py-2 text-left text-[14px] text-white/90 hover:bg-white/[0.04]">
        View
      </button>
      {canArchive ? (
        <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, archive: row.id })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-[#f0c400] hover:bg-white/[0.04]">
          Archive
        </Link>
      ) : null}
      <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, remove: row.id })} className="block px-4 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </div>
  );
}

function VideoActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: VideoTestimonyRow;
  viewModel: TestimoniesViewModel;
  onView: (row: TestimonyRow) => void;
}) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 2;
  const showUpload = row.status === "Drafts" || row.status === "Scheduled";
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  async function uploadNow() {
    if (isUploading) return;
    setIsUploading(true);
    const response = await fetch(`/api/admin/testimonies/${row.id}/upload-now`, {
      method: "POST",
    });
    if (!response.ok) {
      setIsUploading(false);
      return;
    }
    router.push(
      buildTestimoniesHref({
        tab: "video",
        videoStatus: viewModel.activeVideoStatus,
        engagement: viewModel.activeVideoEngagement,
        q: viewModel.searchQuery,
        from: viewModel.filterDraft.from,
        to: viewModel.filterDraft.to,
        category: viewModel.filterDraft.category,
        source: viewModel.filterDraft.source,
        success: "upload",
      }),
    );
  }

  return (
    <div className={`absolute right-0 z-50 min-w-[126px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <button type="button" onClick={() => onView(row)} className="block w-full border-b border-white/10 px-4 py-2 text-left text-[14px] text-white/90 hover:bg-white/[0.04]">
        View
      </button>
      <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, engagement: viewModel.activeVideoEngagement, q: viewModel.searchQuery, edit: row.id })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]">
        Edit
      </Link>
      {showUpload ? (
        <button
          type="button"
          disabled={isUploading}
          onClick={uploadNow}
          className="block w-full border-b border-white/10 px-4 py-2 text-left text-[14px] text-white/90 hover:bg-white/[0.04] disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      ) : null}
      <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, engagement: viewModel.activeVideoEngagement, q: viewModel.searchQuery, remove: row.id })} className="block px-4 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </div>
  );
}

function TopTabs({
  viewModel,
  onTabChange,
}: {
  viewModel: TestimoniesViewModel;
  onTabChange: (tab: TestimonyTab) => void;
}) {
  return (
    <div className="flex rounded-[10px] bg-[var(--color-surface-muted)] p-1">
      {viewModel.tabs.map((tab) => {
        const active = tab.key === viewModel.activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            aria-pressed={active}
            className={`min-w-[76px] rounded-[7px] px-5 py-[7px] text-center text-[13px] ${active ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchAndActions({
  viewModel,
  onOpenFilter,
}: {
  viewModel: TestimoniesViewModel;
  onOpenFilter: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-[290px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <SearchIcon />
        </span>
        <input
          name="q"
          readOnly
          value={viewModel.searchQuery}
          placeholder="Search by name,category"
          className="h-[36px] w-full rounded-[8px] bg-[var(--color-surface-panel)] pl-9 pr-4 text-[12px] text-[var(--color-text-secondary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>
      <button
        type="button"
        onClick={onOpenFilter}
        className="inline-flex h-[36px] min-w-[86px] items-center justify-center gap-2 rounded-[8px] border border-[var(--color-primary)] px-4 text-[14px] text-[var(--color-primary)]"
      >
        <FilterIcon />
        <span>Filter</span>
      </button>
    </div>
  );
}

function TextTable({
  viewModel,
  openMenuId,
  onToggleMenu,
  onView,
}: {
  viewModel: TestimoniesViewModel;
  openMenuId: number | null;
  onToggleMenu: (row: TestimonyRow) => void;
  onView: (row: TestimonyRow) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-[64px_1.1fr_1fr_1fr_0.8fr_0.9fr_0.8fr_110px_54px] bg-[#2a2a2a] px-3 py-[9px] text-[10px] font-medium text-white/70">
        <span>S/N</span>
        <span>Name</span>
        <span>Category</span>
        <span>Date Submitted</span>
        <span>Likes</span>
        <span>Comments</span>
        <span>Shares</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {viewModel.rows.map((row) => {
        const textRow = row as TextTestimonyRow;
        return (
          <div key={textRow.id} className="grid grid-cols-[64px_1.1fr_1fr_1fr_0.8fr_0.9fr_0.8fr_110px_54px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85">
            <span>{textRow.id}</span>
            <span>{textRow.name}</span>
            <span>{textRow.category}</span>
            <span>{textRow.dateSubmitted}</span>
            <span>{textRow.likes}</span>
            <span>{textRow.comments}</span>
            <span>{textRow.shares}</span>
            <span><StatusPill status={textRow.status} /></span>
            <div className="relative flex justify-end text-white/82">
              <button type="button" onClick={() => onToggleMenu(textRow)} aria-label={`Open actions for testimony ${textRow.id}`}>
                <RowMenuIcon />
              </button>
              {openMenuId === textRow.id && !isBottomActionRow(viewModel, textRow) ? <TextActionMenu row={textRow} viewModel={viewModel} onView={onView} /> : null}
            </div>
          </div>
        );
      })}
    </>
  );
}

function VideoStatusTabs({ viewModel }: { viewModel: TestimoniesViewModel }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 text-[13px]">
      {viewModel.videoStatusTabs.map((tab) => (
        <Link
          key={tab.key}
          href={buildTestimoniesHref({ tab: "video", videoStatus: tab.key, engagement: viewModel.activeVideoEngagement, q: viewModel.searchQuery })}
          className={`border-b pb-1 ${tab.key === viewModel.activeVideoStatus ? "border-[var(--color-primary)] text-[var(--color-text-primary)]" : "border-transparent text-[var(--color-text-muted)]"}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function EngagementSelector({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const options = [
    { key: "total", label: "Total" },
    { key: "views", label: "Views" },
    { key: "likes", label: "Likes" },
    { key: "comments", label: "Comments" },
    { key: "shares", label: "Shares" },
  ] as const;

  const activeLabel = options.find((option) => option.key === viewModel.activeVideoEngagement)?.label ?? "Total";

  return (
    <details className="relative">
      <summary className="inline-flex h-[36px] min-w-[158px] cursor-pointer list-none items-center justify-between rounded-[8px] border border-[var(--color-primary)] bg-[var(--color-surface-panel)] px-3 text-[12px] text-white">
        <span>Engagement: {activeLabel}</span>
        <span className="ml-2 text-white/70">▾</span>
      </summary>
      <div className="absolute right-0 z-30 mt-2 min-w-[176px] overflow-hidden rounded-[10px] border border-white/10 bg-[#232323] shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
        {options.map((option) => (
          <Link
            key={option.key}
            href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, engagement: option.key, q: viewModel.searchQuery })}
            className={`block px-3 py-2 text-[12px] hover:bg-white/[0.05] ${viewModel.activeVideoEngagement === option.key ? "text-[var(--color-primary)]" : "text-white/85"}`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function VideoSliceTable({
  viewModel,
  openMenuId,
  onToggleMenu,
  onView,
}: {
  viewModel: TestimoniesViewModel;
  openMenuId: number | null;
  onToggleMenu: (row: TestimonyRow) => void;
  onView: (row: TestimonyRow) => void;
}) {
  const isAll = viewModel.activeVideoStatus === "All";
  const isUploaded = viewModel.activeVideoStatus === "Uploaded";
  const isScheduled = viewModel.activeVideoStatus === "Scheduled";
  const isDrafts = viewModel.activeVideoStatus === "Drafts";

  function EngagementCell({ row }: { row: VideoTestimonyRow }) {
    const views = row.views ?? 0;
    const likes = row.likes ?? 0;
    const comments = row.comments ?? 0;
    const shares = row.shares ?? 0;
    const value =
      viewModel.activeVideoEngagement === "views"
        ? views
        : viewModel.activeVideoEngagement === "likes"
          ? likes
          : viewModel.activeVideoEngagement === "comments"
            ? comments
            : viewModel.activeVideoEngagement === "shares"
              ? shares
              : views + likes + comments + shares;
    return <span className="whitespace-nowrap text-[15px] font-semibold text-white/95">{value}</span>;
  }

  return (
    <div className="space-y-3 px-3 pb-3">
      <div className="grid grid-cols-[2fr_1fr_0.8fr_0.6fr_44px] items-center rounded-[10px] bg-[var(--color-surface-muted)] px-4 py-[10px] text-[10px] font-medium text-[var(--color-text-secondary)]">
        <span>Video</span>
        <span>Meta</span>
        <span>Status</span>
        <span>Engagement</span>
        <span className="text-right">Action</span>
      </div>
      {viewModel.rows.map((row) => {
        const videoRow = row as VideoTestimonyRow;
        return (
          <div key={videoRow.id} className="rounded-[12px] border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="grid grid-cols-[2fr_1fr_0.8fr_0.6fr_44px] items-start gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 gap-3">
                  <span className="relative mt-0.5 block h-[38px] w-[64px] shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-surface-muted)]">
                    <Image src={videoRow.thumbnailSrc} alt={videoRow.title} fill sizes="64px" className="object-cover" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-white/95" title={videoRow.title}>{videoRow.title}</p>
                    <p className="mt-1 truncate text-[12px] text-white/65">{videoRow.category} • {videoRow.source}</p>
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-white/70">
                <p>{isScheduled ? "Scheduled" : "Uploaded"}: {videoRow.dateUploaded}</p>
                {!isScheduled && !isDrafts ? <p className="mt-1 truncate">{videoRow.uploadedBy}</p> : null}
              </div>
              <span><StatusPill status={videoRow.status} /></span>
              <span>{isAll || isUploaded ? <EngagementCell row={videoRow} /> : <span className="text-white/50">—</span>}</span>
              <div className="relative text-right text-[var(--color-text-secondary)]">
                <button type="button" onClick={() => onToggleMenu(videoRow)} aria-label={`Open actions for video testimony ${videoRow.id}`}>
                  <RowMenuIcon />
                </button>
                {openMenuId === videoRow.id && !isBottomActionRow(viewModel, videoRow) ? <VideoActionMenu row={videoRow} viewModel={viewModel} onView={onView} /> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function isBottomActionRow(viewModel: TestimoniesViewModel, row: TestimonyRow | null) {
  if (!row) return false;
  const index = viewModel.rows.findIndex((candidate) => candidate.id === row.id);
  if (index === -1) return false;
  return viewModel.rows.length - index <= 2;
}

export function TestimoniesTable({
  viewModel,
  onOpenFilter,
  onOpenDetails,
  onTabChange,
}: {
  viewModel: TestimoniesViewModel;
  onOpenFilter: () => void;
  onOpenDetails: (row: TestimonyRow) => void;
  onTabChange: (tab: TestimonyTab) => void;
}) {
  const isVideo = viewModel.activeTab === "video";
  const [openMenuId, setOpenMenuId] = useState<number | null>(
    viewModel.showActionMenu && viewModel.selectedRow ? viewModel.selectedRow.id : null,
  );
  const openMenuRow = openMenuId ? viewModel.rows.find((row) => row.id === openMenuId) ?? null : null;
  const showDetachedActionMenu = isBottomActionRow(viewModel, openMenuRow);

  function toggleActionMenu(row: TestimonyRow) {
    setOpenMenuId((current) => (current === row.id ? null : row.id));
  }

  function openDetails(row: TestimonyRow) {
    setOpenMenuId(null);
    onOpenDetails(row);
  }

  return (
    <div className="relative max-w-[1248px] rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="rounded-[20px]">
        <div className="flex flex-col gap-4 px-4 pt-5 md:flex-row md:items-center md:justify-between md:px-5 md:pt-5">
          <TopTabs viewModel={viewModel} onTabChange={onTabChange} />
          <div className="flex flex-wrap items-center gap-3">
            <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, engagement: viewModel.activeVideoEngagement, settings: true })} className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[var(--color-primary)] px-5 text-[14px] leading-[1.25] text-[var(--color-primary)]">
              Manage Settings
            </Link>
            <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, engagement: viewModel.activeVideoEngagement, screen: "activity" })} className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--color-primary)] px-5 text-[14px] font-medium text-[var(--color-text-primary)]">
              View Activity Log
            </Link>
          </div>
        </div>

        {!isVideo ? <div className="px-4 pb-2 pt-6 text-[18px] font-medium text-[var(--color-text-primary)] md:px-5">Testimony</div> : null}
        <div className={`px-4 md:px-5 ${isVideo ? "pb-5 pt-6 md:pb-6 md:pt-7" : "pb-4"}`}>
          {isVideo ? (
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <VideoStatusTabs viewModel={viewModel} />
              <div className="flex flex-wrap items-center gap-3">
                <EngagementSelector viewModel={viewModel} />
                <SearchAndActions viewModel={viewModel} onOpenFilter={onOpenFilter} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div />
              <SearchAndActions viewModel={viewModel} onOpenFilter={onOpenFilter} />
            </div>
          )}
        </div>

        <div className="border-t border-white/5">
          {viewModel.phaseState === "loading" ? <TestimoniesLoading video={isVideo} /> : null}
          {viewModel.phaseState === "empty" ? <TestimoniesEmpty /> : null}
          {viewModel.phaseState === "error" ? <TestimoniesError message={viewModel.errorMessage} /> : null}
          {viewModel.phaseState === "populated" && !isVideo ? (
            <TextTable viewModel={viewModel} openMenuId={openMenuId} onToggleMenu={toggleActionMenu} onView={openDetails} />
          ) : null}
          {viewModel.phaseState === "populated" && isVideo ? (
            <VideoSliceTable viewModel={viewModel} openMenuId={openMenuId} onToggleMenu={toggleActionMenu} onView={openDetails} />
          ) : null}
        </div>

        <div className="flex items-center justify-between px-4 py-10 text-[12px] text-[var(--color-text-muted)] md:px-5">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/20 px-4 py-2 text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[var(--color-primary)] px-5 py-2 text-[var(--color-primary)]">Next</button>
          </div>
        </div>
      </div>

      {showDetachedActionMenu && openMenuRow?.kind === "text" ? (
        <div className="absolute bottom-[92px] right-5 z-50">
          <TextActionMenu row={openMenuRow} viewModel={viewModel} onView={openDetails} />
        </div>
      ) : null}

      {showDetachedActionMenu && openMenuRow?.kind === "video" ? (
        <div className="absolute bottom-[92px] right-5 z-50">
          <VideoActionMenu row={openMenuRow} viewModel={viewModel} onView={openDetails} />
        </div>
      ) : null}

      {openMenuRow ? (
        <button
          type="button"
          onClick={() => setOpenMenuId(null)}
          className="fixed inset-0 z-40"
          aria-label="Close testimonies action menu"
        />
      ) : null}
    </div>
  );
}
