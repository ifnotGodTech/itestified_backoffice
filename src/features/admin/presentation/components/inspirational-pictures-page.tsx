"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { InspirationalPictureRow, InspirationalPicturesViewModel, InspirationalPictureStatus } from "@/features/admin/domain/entities/inspirational-pictures";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import {
  AdminActionMenuBackdrop,
  AdminActionMenuPanel,
  AdminRowMenuIcon,
  AdminSearchIcon,
  AdminStatusBadge,
} from "@/features/admin/presentation/components/shared/admin-table-primitives";
import { buildInspirationalPicturesHref } from "@/features/admin/presentation/state/inspirational-pictures-route-state";

function StatusPill({ status }: { status: InspirationalPictureRow["status"] }) {
  const cls =
    status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : status === "Scheduled"
        ? "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"
        : "border-white/20 bg-[#252525] text-white/70";

  return <AdminStatusBadge label={status} toneClassName={cls} />;
}

function SafePictureImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className: string;
}) {
  const canUseNextImage = src.startsWith("/") || src.startsWith("https://placehold.co/");

  if (canUseNextImage) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={className} />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- External admin-provided URLs can be unconfigured for next/image.
  return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
}

function closeHref(viewModel: InspirationalPicturesViewModel) {
  return buildInspirationalPicturesHref({
    status: viewModel.activeStatus,
    screen: viewModel.activeScreen,
    q: viewModel.searchQuery,
  });
}

function picturesStatusHref(viewModel: InspirationalPicturesViewModel, status: InspirationalPictureStatus) {
  return buildInspirationalPicturesHref({
    status,
    q: viewModel.searchQuery,
  });
}

function picturesApiHref(viewModel: InspirationalPicturesViewModel, status: InspirationalPictureStatus) {
  const params = new URLSearchParams();
  params.set("status", status);
  if (viewModel.searchQuery) params.set("q", viewModel.searchQuery);
  return `/api/admin/inspirational-pictures/list?${params.toString()}`;
}

function loadingPicturesViewModel(viewModel: InspirationalPicturesViewModel, status: InspirationalPictureStatus): InspirationalPicturesViewModel {
  return {
    ...viewModel,
    activeStatus: status,
    phaseState: "loading",
    rows: [],
    selectedRow: null,
    totalRows: 0,
    showingLabel: "Loading pictures...",
    showActionMenu: false,
    showDetails: false,
    showEditModal: false,
    showDeleteModal: false,
  };
}

function ActionMenu({
  row,
  viewModel,
  onView,
}: {
  row: InspirationalPictureRow;
  viewModel: InspirationalPicturesViewModel;
  onView?: (row: InspirationalPictureRow) => void;
}) {
  return (
    <AdminActionMenuPanel className="min-w-[99px] rounded-[10px] border-[#787878] bg-[#292929] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
      <button type="button" onClick={() => onView?.(row)} className="block w-full border-b border-[#787878] px-2 py-[6px] text-left text-[10px] leading-[1.36] text-white hover:bg-white/[0.04]">
        View
      </button>
      <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, edit: row.id })} className="block border-b border-[#787878] px-2 py-[6px] text-[10px] leading-[1.36] text-white hover:bg-white/[0.04]">
        Edit
      </Link>
      <Link href={buildInspirationalPicturesHref({ status: viewModel.activeStatus, q: viewModel.searchQuery, remove: row.id })} className="block px-2 py-[6px] text-[10px] leading-[1.36] text-[#ef4335] hover:bg-white/[0.04]">
        Delete
      </Link>
    </AdminActionMenuPanel>
  );
}

function isBottomActionRow(viewModel: InspirationalPicturesViewModel, row: InspirationalPictureRow | null) {
  if (!row) return false;
  const index = viewModel.rows.findIndex((candidate) => candidate.id === row.id);
  if (index === -1) return false;
  return viewModel.rows.length - index <= 2;
}

function DetailModal({ row, viewModel, onClose }: { row: InspirationalPictureRow; viewModel: InspirationalPicturesViewModel; onClose?: () => void }) {
  const detailRows =
    row.status === "Scheduled"
      ? [
          { label: "Scheduled Date", value: row.dateLabel, emphasis: true },
          { label: "Scheduled Time", value: row.scheduledTime ?? "03:00PM", emphasis: true },
          { label: "Source", value: row.source, emphasis: true },
          { label: "Number of downloads", value: String(row.downloadCount), emphasis: true },
          { label: "Number of shares", value: String(row.shareCount), emphasis: true },
        ]
      : [
          { label: "Uploaded By", value: row.uploadedBy, emphasis: true },
          { label: "Upload Date", value: row.dateLabel, emphasis: true },
          { label: "Number of downloads", value: String(row.downloadCount), emphasis: true },
          { label: "Number of shares", value: String(row.shareCount), emphasis: true },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      {onClose ? (
        <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close picture details modal" />
      ) : (
        <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close picture details modal" />
      )}
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[561px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Picture Details</h2>
          {onClose ? (
            <button type="button" onClick={onClose} className="text-[34px] leading-none text-white/90" aria-label="Dismiss picture details">×</button>
          ) : (
            <Link href={closeHref(viewModel)} className="text-[34px] leading-none text-white/90" aria-label="Dismiss picture details">×</Link>
          )}
        </div>
        <div className="overflow-y-auto px-6 pb-7 pt-6">
          <div className="relative h-[297px] overflow-hidden rounded-[16px] bg-[radial-gradient(circle_at_top,#5d3d76_0%,#31213f_38%,#1f1f1f_100%)]">
            <SafePictureImage src={row.imageSrc} alt={row.title} sizes="280px" className="object-contain p-10 opacity-90" />
          </div>
          <dl className="mt-8 space-y-0 text-[16px] text-white/90">
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Title</dt>
              <dd className="text-right font-semibold leading-[1.36] text-white">{row.title}</dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Category</dt>
              <dd className="text-right font-semibold leading-[1.36] text-white">{row.category}</dd>
            </div>
            {detailRows.map((item) => (
              <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
                <dt className="leading-[1.36] text-white/90">{item.label}</dt>
                <dd className={`text-right leading-[1.36] ${item.emphasis ? "font-semibold text-white" : "text-white/90"}`}>{item.value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-8 px-6 py-2">
              <dt className="leading-[1.36] text-white/90">Status</dt>
              <dd className="text-right"><StatusPill status={row.status} /></dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function EditModal({ row, viewModel }: { row: InspirationalPictureRow; viewModel: InspirationalPicturesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close edit picture modal" />
      <form
        action={`/api/admin/content/inspirational-pictures/${row.id}`}
        method="POST"
        className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[561px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Edit Picture</h2>
          <Link href={closeHref(viewModel)} className="text-[34px] leading-none text-white/90">×</Link>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-7">
          <div>
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Title</p>
            <input name="title" defaultValue={row.title} className="w-full rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white" />
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Category</p>
            <input name="category" defaultValue={row.category} className="w-full rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white" />
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Image URL</p>
            <input name="image_url" defaultValue={row.imageUrl ?? row.imageSrc} className="w-full rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white" />
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] leading-[1.5] text-white/90">Source</p>
            <input name="source" defaultValue={row.source} className="w-full rounded-[10px] border border-white/10 bg-[#2a2a2a] px-4 py-4 text-[15px] leading-[1.5] text-white" />
          </div>
          <input type="hidden" name="status" value={row.status === "Scheduled" ? "scheduled" : row.status === "Uploaded" ? "published" : "draft"} />
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] font-medium text-[#9B68D5]">Cancel</Link>
          <button type="submit" className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] font-medium text-white">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  const selectedId = viewModel.selectedRow?.id;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete picture modal" />
      <div className="relative z-10 w-full max-w-[398px] rounded-[24px] bg-[#1f1f1f] px-8 py-10 text-center shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <h2 className="text-[28px] font-semibold leading-[1.18] text-white">Delete This Picture?</h2>
        <p className="mt-5 text-[16px] leading-8 text-white/72">Are you sure you want to delete this picture? This action cannot be undone.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] font-medium text-[#9B68D5]">Cancel</Link>
          {selectedId ? (
            <form action={`/api/admin/content/inspirational-pictures/${selectedId}/unpublish/`} method="POST">
              <button type="submit" className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] font-medium text-white">Unpublish</button>
            </form>
          ) : (
            <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] font-medium text-white">Unpublish</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close upload success modal" />
      <div className="relative z-10 w-full max-w-[398px] rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_2px_10px_4px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
        <p className="mt-10 text-[28px] font-semibold leading-[1.3] text-white">{viewModel.successMessage}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-[18px] font-medium text-white/90">No Pictures here Yet</p>
    </div>
  );
}

function UploadScreen() {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <form action="/api/admin/content/inspirational-pictures" method="POST" className="rounded-[24px] bg-[#171717] px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:px-10 md:py-10">
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-[32px] font-semibold leading-[1.36] text-white">Upload Picture</h2>
          <Link href={buildInspirationalPicturesHref({})} aria-label="Close upload picture screen" className="inline-flex h-6 w-6 items-center justify-center text-[20px] leading-none text-white/90">
            ×
          </Link>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_398px]">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Picture Source</p>
              <input name="source" placeholder="https://..." className="w-full rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/85 placeholder:text-white/35" />
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Category</p>
              <input name="category" placeholder="Faith" className="w-full rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/85 placeholder:text-white/35" />
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Title</p>
              <input name="title" placeholder="Morning Mercy" className="w-full rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/85 placeholder:text-white/35" />
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Caption</p>
              <textarea name="caption" placeholder="Type caption..." className="w-full rounded-[10px] border border-white/10 bg-[#242424] px-4 py-4 text-[14px] leading-[1.36] text-white/85 placeholder:text-white/35" />
            </div>
            <div>
              <p className="mb-3 text-[14px] leading-[1.36] text-white/90">Upload Status</p>
              <div className="flex flex-wrap gap-x-7 gap-y-4 text-[14px] leading-[1.36] text-white/90">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="status" value="published" defaultChecked className="h-[16px] w-[16px] accent-[#9966CC]" />
                  Upload now
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="status" value="scheduled" className="h-[16px] w-[16px] accent-[#9966CC]" />
                  Schedule for later
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="status" value="draft" className="h-[16px] w-[16px] accent-[#9966CC]" />
                  Drafts
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="datetime-local" name="publish_at" className="rounded-[10px] border border-white/10 bg-[#242424] px-4 py-3 text-[14px] text-white/85" />
              <input type="datetime-local" name="expires_at" className="rounded-[10px] border border-white/10 bg-[#242424] px-4 py-3 text-[14px] text-white/85" />
            </div>
          </div>
          <div className="rounded-[16px] border border-dashed border-white/10 bg-[#1f1f1f] p-5">
            <div className="flex h-[250px] items-center justify-center rounded-[12px] border border-dashed border-white/10 bg-[#242424] text-center">
              <div className="max-w-[255px]">
                <p className="text-[14px] leading-[1.5] text-white/90">Drag & drop or choose file here to upload</p>
                <p className="mt-2 text-[12px] leading-[1.4] text-white/40">JPG, PNG, Max size (20mb)</p>
                <input name="image_url" placeholder="https://images.example.com/pic.jpg" className="mt-3 w-full rounded-[8px] border border-white/10 bg-[#1a1a1a] px-3 py-2 text-[12px] text-white/85 placeholder:text-white/35" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="inline-flex h-[40px] min-w-[106px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 text-[14px] font-medium text-white">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}

function PicturesGrid({
  viewModel,
  onStatusChange,
  onOpenMenu,
  onView,
}: {
  viewModel: InspirationalPicturesViewModel;
  onStatusChange?: (status: InspirationalPictureStatus) => void;
  onOpenMenu?: (row: InspirationalPictureRow) => void;
  onView?: (row: InspirationalPictureRow) => void;
}) {
  const headers =
    viewModel.activeStatus === "Scheduled"
      ? ["S/N", "Thumbnail", "Category", "Scheduled Date", "Scheduled Time", "Source", "Status", "Actions"]
      : ["S/N", "Thumbnail", "Category", "Date Uploaded", "Uploaded By", "Status", "Actions"];

  const tableColumns =
    viewModel.activeStatus === "Scheduled"
      ? "grid-cols-[76px_99px_135px_135px_135px_135px_115px_64px]"
      : "grid-cols-[76px_99px_135px_135px_135px_115px_64px]";

  return (
    <div className="rounded-[20px] bg-[#171717] px-5 pb-10 pt-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-6 border-b border-white/10 px-1 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-5">
          <h2 className="text-[16px] font-normal leading-[1.36] text-white">Inspirational Pictures</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
          {viewModel.statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange?.(tab.key)}
              aria-pressed={tab.key === viewModel.activeStatus}
              className={`border-b pb-1 text-[14px] font-normal leading-[1.36] ${tab.key === viewModel.activeStatus ? "border-[#9B68D5] text-white" : "border-transparent text-white/55"}`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[289px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45"><AdminSearchIcon /></span>
            <input readOnly value={viewModel.searchQuery} placeholder="Search by Source" className="h-[36px] w-full rounded-[8px] border border-white/10 bg-white/[0.05] pl-9 pr-4 text-[10px] text-white/80 outline-none placeholder:text-white/45" />
          </div>
          <Link href={buildInspirationalPicturesHref({ screen: "upload" })} className="inline-flex h-[40px] min-w-[144px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-5 text-[14px] font-medium text-white">
            Upload Pictures
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className={`${viewModel.activeStatus === "Scheduled" ? "min-w-[940px]" : "min-w-[820px]"}`}>
          <div className={`grid ${tableColumns} items-center rounded-[10px] bg-white/[0.03] px-4 py-[10px] text-[10px] font-semibold leading-[1.36] text-white`}>
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-[2px]">
                <span>{header}</span>
                {header !== "Actions" ? <span className="text-white/70">↕</span> : null}
              </div>
            ))}
          </div>

          <div className="divide-y divide-white/10">
            {viewModel.rows.map((row, index) => (
              <div key={row.id} className={`grid ${tableColumns} items-center px-4 py-3 text-[10px] text-white/90`}>
                <div className="text-[10px] leading-[1.36] text-white/70">{index + 1}</div>
                <div className="flex items-center">
                  <div className="relative h-[50px] w-[67px] overflow-hidden rounded-[8px] bg-[radial-gradient(circle_at_top,#5d3d76_0%,#31213f_38%,#1f1f1f_100%)]">
                    <SafePictureImage src={row.imageSrc} alt={row.title} sizes="56px" className="object-contain p-2 opacity-90" />
                  </div>
                </div>
                <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.category}</div>
                {viewModel.activeStatus === "Scheduled" ? (
                  <>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.dateLabel}</div>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.scheduledTime ?? "03:00PM"}</div>
                    <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.source}</div>
                    <div><StatusPill status={row.status} /></div>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] leading-[1.36] text-white/80">{row.dateLabel}</div>
                    <div className="truncate text-[10px] leading-[1.36] text-white/80">{row.uploadedBy}</div>
                    <div><StatusPill status={row.status} /></div>
                  </>
                )}
                <div className="relative justify-self-start text-white/82">
                  <button type="button" onClick={() => onOpenMenu?.(row)} aria-label={`Open actions for picture ${row.id}`} className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/[0.04]">
                    <span className="scale-90"><AdminRowMenuIcon /></span>
                  </button>
                  {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id && !isBottomActionRow(viewModel, row) ? (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                      <ActionMenu row={row} viewModel={viewModel} onView={onView} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between text-[12px] text-white/45">
        <span>{viewModel.showingLabel}</span>
        <div className="flex gap-3">
          <button type="button" className="h-[35px] min-w-[75px] rounded-[8px] border border-white/20 px-3 py-2 text-[14px] text-white/45">Previous</button>
          <button type="button" className="h-[35px] min-w-[59px] rounded-[8px] border border-[#9B68D5] px-3 py-2 text-[14px] text-[#9B68D5]">Next</button>
        </div>
      </div>
    </div>
  );
}

export function InspirationalPicturesPage({ viewModel }: { viewModel: InspirationalPicturesViewModel }) {
  const [currentViewModel, setCurrentViewModel] = useState(viewModel);
  const [menuRow, setMenuRow] = useState<InspirationalPictureRow | null>(null);
  const [detailRow, setDetailRow] = useState<InspirationalPictureRow | null>(null);
  const [statusCache, setStatusCache] = useState<Partial<Record<InspirationalPictureStatus, InspirationalPicturesViewModel>>>({
    [viewModel.activeStatus]: viewModel,
  });

  useEffect(() => {
    setCurrentViewModel(viewModel);
    setMenuRow(null);
    setDetailRow(null);
    setStatusCache({ [viewModel.activeStatus]: viewModel });
  }, [viewModel]);

  async function switchStatus(status: InspirationalPictureStatus) {
    if (status === currentViewModel.activeStatus) return;
    window.history.pushState(null, "", picturesStatusHref(currentViewModel, status));
    setMenuRow(null);
    setDetailRow(null);
    const cached = statusCache[status];
    if (cached) {
      setCurrentViewModel(cached);
      return;
    }
    setCurrentViewModel((current) => loadingPicturesViewModel(current, status));
    try {
      const response = await fetch(picturesApiHref(currentViewModel, status));
      if (!response.ok) throw new Error("Unable to load inspirational pictures.");
      const nextViewModel = (await response.json()) as InspirationalPicturesViewModel;
      setStatusCache((current) => ({ ...current, [status]: nextViewModel }));
      setCurrentViewModel(nextViewModel);
    } catch {
      setCurrentViewModel((current) => ({
        ...loadingPicturesViewModel(current, status),
        phaseState: "error",
        errorMessage: "We could not load inspirational pictures right now. Please try again.",
      }));
    }
  }

  const interactiveViewModel: InspirationalPicturesViewModel = {
    ...currentViewModel,
    selectedRow: menuRow ?? detailRow ?? currentViewModel.selectedRow,
    showActionMenu: Boolean(menuRow) || currentViewModel.showActionMenu,
    showDetails: Boolean(detailRow) || currentViewModel.showDetails,
  };
  const selectedRow = interactiveViewModel.selectedRow;
  const showDetachedActionMenu = interactiveViewModel.showActionMenu && isBottomActionRow(interactiveViewModel, selectedRow);

  return (
    <AdminDashboardShell viewModel={interactiveViewModel.shell} pageTitle={interactiveViewModel.activeScreen === "upload" ? undefined : "Inspirational Pictures"}>
      {interactiveViewModel.activeScreen === "upload" ? <UploadScreen /> : null}
      {interactiveViewModel.activeScreen === "list" && interactiveViewModel.phaseState === "empty" ? <EmptyState /> : null}
      {interactiveViewModel.activeScreen === "list" && interactiveViewModel.phaseState === "loading" ? <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center text-white/70">Loading pictures...</div> : null}
      {interactiveViewModel.activeScreen === "list" && interactiveViewModel.phaseState === "error" ? <div className="rounded-[20px] bg-[#171717] px-8 py-16 text-center text-white/70">{interactiveViewModel.errorMessage}</div> : null}
      {interactiveViewModel.activeScreen === "list" && interactiveViewModel.phaseState === "populated" ? (
        <div className="relative">
          <PicturesGrid
            viewModel={interactiveViewModel}
            onStatusChange={switchStatus}
            onOpenMenu={(row) => setMenuRow(row)}
            onView={(row) => {
              setMenuRow(null);
              setDetailRow(row);
            }}
          />
          {showDetachedActionMenu && selectedRow ? (
            <div className="fixed bottom-24 right-8 z-50 sm:right-10">
              <ActionMenu
                row={selectedRow}
                viewModel={interactiveViewModel}
                onView={(row) => {
                  setMenuRow(null);
                  setDetailRow(row);
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {interactiveViewModel.showDetails && selectedRow ? <DetailModal row={selectedRow} viewModel={interactiveViewModel} onClose={detailRow ? () => setDetailRow(null) : undefined} /> : null}
      {interactiveViewModel.showEditModal && selectedRow ? <EditModal row={selectedRow} viewModel={interactiveViewModel} /> : null}
      {interactiveViewModel.showDeleteModal ? <DeleteModal viewModel={interactiveViewModel} /> : null}
      {interactiveViewModel.showSuccess && interactiveViewModel.successMessage ? <SuccessModal viewModel={interactiveViewModel} /> : null}
      {interactiveViewModel.showActionMenu ? (
        menuRow ? (
          <button type="button" onClick={() => setMenuRow(null)} className="fixed inset-0 z-40" aria-label="Close inspirational pictures action menu" />
        ) : (
          <AdminActionMenuBackdrop
            href={buildInspirationalPicturesHref({ status: interactiveViewModel.activeStatus, screen: interactiveViewModel.activeScreen, q: interactiveViewModel.searchQuery })}
            label="Close inspirational pictures action menu"
          />
        )
      ) : null}
    </AdminDashboardShell>
  );
}
