import Image from "next/image";
import Link from "next/link";
import type { TestimoniesViewModel, TestimonyRow, TestimonyStatus, TextTestimonyRow, VideoTestimonyRow } from "@/features/admin/domain/entities/testimonies";
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

function SortIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]" fill="none" aria-hidden="true">
      <path d="M3.25 4.5 6 1.75 8.75 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.75 7.5 6 10.25 3.25 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

function TextActionMenu({ row, viewModel }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel }) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 2;

  return (
    <div className={`absolute right-0 z-50 min-w-[118px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, view: row.id })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]">
        View
      </Link>
      <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, remove: row.id })} className="block px-4 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </div>
  );
}

function VideoActionMenu({ row, viewModel }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel }) {
  const openUp = viewModel.rows.length - viewModel.rows.indexOf(row) <= 2;
  const showUpload = row.status === "Drafts" || row.status === "Scheduled";

  return (
    <div className={`absolute right-0 z-50 min-w-[126px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${openUp ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"}`}>
      <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, view: row.id })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]">
        View
      </Link>
      <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, edit: row.id })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]">
        Edit
      </Link>
      {showUpload ? (
        <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, success: "upload" })} className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]">
          Upload
        </Link>
      ) : null}
      <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, remove: row.id })} className="block px-4 py-2 text-[14px] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </div>
  );
}

function HeaderLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span>{label}</span>
      <SortIcon />
    </span>
  );
}

function TopTabs({ viewModel }: { viewModel: TestimoniesViewModel }) {
  return (
    <div className="flex rounded-[10px] bg-[var(--color-surface-muted)] p-1">
      {viewModel.tabs.map((tab) => {
        const href = buildTestimoniesHref({
          tab: tab.key,
          videoStatus: tab.key === "video" ? viewModel.activeVideoStatus : null,
          state: viewModel.phaseState === "populated" ? null : viewModel.phaseState,
          q: viewModel.searchQuery,
          statusFilter: viewModel.filterDraft.status,
        });
        const active = tab.key === viewModel.activeTab;

        return (
          <Link key={tab.key} href={href} className={`min-w-[76px] rounded-[7px] px-5 py-[7px] text-center text-[13px] ${active ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function SearchAndActions({ viewModel }: { viewModel: TestimoniesViewModel }) {
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
      <Link
        href={buildTestimoniesHref({
          tab: viewModel.activeTab,
          videoStatus: viewModel.activeTab === "video" ? viewModel.activeVideoStatus : null,
          q: viewModel.searchQuery,
          from: viewModel.filterDraft.from,
          to: viewModel.filterDraft.to,
          category: viewModel.filterDraft.category,
          source: viewModel.filterDraft.source,
          filter: true,
          statusFilter: viewModel.filterDraft.status,
        })}
        className="inline-flex h-[36px] min-w-[86px] items-center justify-center gap-2 rounded-[8px] border border-[var(--color-primary)] px-4 text-[14px] text-[var(--color-primary)]"
      >
        <FilterIcon />
        <span>Filter</span>
      </Link>
    </div>
  );
}

function TextTable({ viewModel }: { viewModel: TestimoniesViewModel }) {
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
              <Link href={buildTestimoniesHref({ tab: "text", q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, menu: textRow.id })} aria-label={`Open actions for testimony ${textRow.id}`}>
                <RowMenuIcon />
              </Link>
              {viewModel.showActionMenu && viewModel.selectedRow?.id === textRow.id && !isBottomActionRow(viewModel, textRow) ? <TextActionMenu row={textRow} viewModel={viewModel} /> : null}
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
          href={buildTestimoniesHref({ tab: "video", videoStatus: tab.key, q: viewModel.searchQuery })}
          className={`border-b pb-1 ${tab.key === viewModel.activeVideoStatus ? "border-[var(--color-primary)] text-[var(--color-text-primary)]" : "border-transparent text-[var(--color-text-muted)]"}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function VideoTable({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const isAll = viewModel.activeVideoStatus === "All";
  const isUploaded = viewModel.activeVideoStatus === "Uploaded";
  const isScheduled = viewModel.activeVideoStatus === "Scheduled";
  const isDrafts = viewModel.activeVideoStatus === "Drafts";

  const gridClass = isAll
    ? "grid min-w-[1220px] grid-cols-[76px_113px_108px_113px_88px_104px_113px_72px_72px_88px_72px_104px_60px] items-center"
    : isUploaded
      ? "grid min-w-[1140px] grid-cols-[76px_108px_108px_108px_88px_104px_113px_72px_72px_88px_72px_60px] items-center"
      : isScheduled
        ? "grid min-w-[1180px] grid-cols-[76px_152px_178px_168px_136px_168px_136px_76px] items-center"
        : "grid min-w-[980px] grid-cols-[76px_152px_230px_176px_170px_76px] items-center";

  return (
    <div className="overflow-x-auto">
      <div className={`${gridClass} bg-[var(--color-surface-muted)] px-4 py-[11px] text-[10px] font-medium text-[var(--color-text-secondary)]`}>
        <HeaderLabel label="S/N" />
        <HeaderLabel label="Thumbnail" />
        <HeaderLabel label="Title" />
        <HeaderLabel label="Category" />
        <HeaderLabel label="Source" />
        {isScheduled ? <HeaderLabel label="Scheduled Date" /> : null}
        {!isScheduled && !isDrafts ? <HeaderLabel label="Date Uploaded" /> : null}
        {isScheduled ? <HeaderLabel label="Time" /> : null}
        {!isScheduled && !isDrafts ? <HeaderLabel label="Uploaded By" /> : null}
        {isAll || isUploaded ? <HeaderLabel label="Views" /> : null}
        {isAll || isUploaded ? <HeaderLabel label="Likes" /> : null}
        {isAll || isUploaded ? <HeaderLabel label="Comments" /> : null}
        {isAll || isUploaded ? <HeaderLabel label="Shares" /> : null}
        {isAll ? <HeaderLabel label="Status" /> : null}
        <span>Action</span>
      </div>
      {viewModel.rows.map((row) => {
        const videoRow = row as VideoTestimonyRow;
        const stat = (value: number | null) => (value == null ? "N/A" : value);
        return (
          <div key={videoRow.id} className={`${gridClass} border-t border-white/10 px-4 py-[10px] text-[12px] text-[var(--color-text-secondary)]`}>
            <span>{videoRow.id}</span>
            <span className="pr-2">
              <span className="relative block h-[24px] w-[40px] overflow-hidden rounded-[4px] bg-[var(--color-surface-muted)]">
                <Image src={videoRow.thumbnailSrc} alt={videoRow.title} fill className="object-cover" />
              </span>
            </span>
            <span className="truncate pr-3">{videoRow.title}</span>
            <span className="truncate pr-3">{videoRow.category}</span>
            <span className="whitespace-nowrap">{videoRow.source}</span>
            {isScheduled ? <span className="whitespace-nowrap">{videoRow.dateUploaded}</span> : null}
            {!isScheduled && !isDrafts ? <span className="whitespace-nowrap">{videoRow.dateUploaded}</span> : null}
            {isScheduled ? <span className="whitespace-nowrap">08:00 PM</span> : null}
            {!isScheduled && !isDrafts ? <span className="truncate pr-2">{videoRow.uploadedBy}</span> : null}
            {isAll || isUploaded ? <span className="whitespace-nowrap">{stat(videoRow.views)}</span> : null}
            {isAll || isUploaded ? <span className="whitespace-nowrap">{stat(videoRow.likes)}</span> : null}
            {isAll || isUploaded ? <span className="whitespace-nowrap">{stat(videoRow.comments)}</span> : null}
            {isAll || isUploaded ? <span className="whitespace-nowrap">{stat(videoRow.shares)}</span> : null}
            {isAll ? <span><StatusPill status={videoRow.status} /></span> : null}
            <div className="relative flex justify-end text-[var(--color-text-secondary)]">
              <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, menu: videoRow.id })} aria-label={`Open actions for video testimony ${videoRow.id}`}>
                <RowMenuIcon />
              </Link>
              {viewModel.showActionMenu && viewModel.selectedRow?.id === videoRow.id && !isBottomActionRow(viewModel, videoRow) ? <VideoActionMenu row={videoRow} viewModel={viewModel} /> : null}
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

export function TestimoniesTable({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const isVideo = viewModel.activeTab === "video";
  const showDetachedActionMenu = viewModel.showActionMenu && isBottomActionRow(viewModel, viewModel.selectedRow);

  return (
    <div className="relative max-w-[1248px] rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="rounded-[20px]">
        <div className="flex flex-col gap-4 px-4 pt-5 md:flex-row md:items-center md:justify-between md:px-5 md:pt-5">
          <TopTabs viewModel={viewModel} />
          <div className="flex flex-wrap items-center gap-3">
            <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, settings: true })} className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[var(--color-primary)] px-5 text-[14px] leading-[1.25] text-[var(--color-primary)]">
              Manage Settings
            </Link>
            <Link href={buildTestimoniesHref({ tab: "video", screen: "activity" })} className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[var(--color-primary)] px-5 text-[14px] font-medium text-[var(--color-text-primary)]">
              View Activity Log
            </Link>
          </div>
        </div>

        {!isVideo ? <div className="px-4 pb-2 pt-6 text-[18px] font-medium text-[var(--color-text-primary)] md:px-5">Testimony</div> : null}
        <div className={`px-4 md:px-5 ${isVideo ? "pb-5 pt-6 md:pb-6 md:pt-7" : "pb-4"}`}>
          {isVideo ? (
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <VideoStatusTabs viewModel={viewModel} />
              <SearchAndActions viewModel={viewModel} />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div />
              <SearchAndActions viewModel={viewModel} />
            </div>
          )}
        </div>

        <div className="border-t border-white/5">
          {viewModel.phaseState === "loading" ? <TestimoniesLoading video={isVideo} /> : null}
          {viewModel.phaseState === "empty" ? <TestimoniesEmpty /> : null}
          {viewModel.phaseState === "error" ? <TestimoniesError message={viewModel.errorMessage} /> : null}
          {viewModel.phaseState === "populated" && !isVideo ? <TextTable viewModel={viewModel} /> : null}
          {viewModel.phaseState === "populated" && isVideo ? <VideoTable viewModel={viewModel} /> : null}
        </div>

        <div className="flex items-center justify-between px-4 py-10 text-[12px] text-[var(--color-text-muted)] md:px-5">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/20 px-4 py-2 text-white/45">Previous</button>
            <button type="button" className="rounded-[8px] border border-[var(--color-primary)] px-5 py-2 text-[var(--color-primary)]">Next</button>
          </div>
        </div>
      </div>

      {showDetachedActionMenu && viewModel.selectedRow?.kind === "text" ? (
        <div className="absolute bottom-[92px] right-5 z-50">
          <TextActionMenu row={viewModel.selectedRow} viewModel={viewModel} />
        </div>
      ) : null}

      {showDetachedActionMenu && viewModel.selectedRow?.kind === "video" ? (
        <div className="absolute bottom-[92px] right-5 z-50">
          <VideoActionMenu row={viewModel.selectedRow} viewModel={viewModel} />
        </div>
      ) : null}

      {viewModel.showActionMenu && viewModel.selectedRow ? (
        <Link
          href={buildTestimoniesHref({
            tab: viewModel.activeTab,
            videoStatus: isVideo ? viewModel.activeVideoStatus : null,
            q: viewModel.searchQuery,
            statusFilter: viewModel.filterDraft.status,
          })}
          className="fixed inset-0 z-40"
          aria-label="Close testimonies action menu"
        />
      ) : null}
    </div>
  );
}
