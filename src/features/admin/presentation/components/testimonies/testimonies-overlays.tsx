"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { TestimoniesViewModel, TestimonyRow, TextTestimonyRow, VideoTestimonyRow } from "@/features/admin/domain/entities/testimonies";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";

function StatusPill({ status }: { status: string }) {
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M5 5 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
      <path d="M2.25 4.25 6 8l3.75-3.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.25" width="13.5" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.25 6.75h13.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 1.75v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 1.75v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.25 9.75h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.25 9.75h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.25 12.25h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.25 12.25h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TimeIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.25v4.2l2.8 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayerControlBar() {
  return (
    <div className="px-3 pb-3 pt-2 text-white/88">
      <div className="h-[4px] rounded-full bg-white">
        <div className="h-[4px] w-[3%] rounded-full bg-[#9B68D5]" />
      </div>
      <div className="mt-3 flex items-center justify-between text-[14px]">
        <div className="flex items-center gap-4">
          <span className="text-[15px]">▶</span>
          <span>↺5</span>
          <span className="rounded-[4px] bg-white px-2 py-0.5 text-[12px] text-black">1x</span>
          <span>↻5</span>
        </div>
        <div className="flex items-center gap-4">
          <span>🔊</span>
          <span>⚙</span>
          <span>⛶</span>
        </div>
      </div>
    </div>
  );
}

function closeHref(viewModel: TestimoniesViewModel) {
  return buildTestimoniesHref({
    tab: viewModel.activeTab,
    videoStatus: viewModel.activeTab === "video" ? viewModel.activeVideoStatus : null,
    q: viewModel.searchQuery,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    category: viewModel.filterDraft.category,
    source: viewModel.filterDraft.source,
    statusFilter: viewModel.filterDraft.status,
    origin: viewModel.origin === "notification" ? "notification" : null,
  });
}

function DetailOriginBanner({ viewModel }: { viewModel: TestimoniesViewModel }) {
  if (viewModel.origin !== "notification" || !viewModel.detailReturnHref) return null;

  return (
    <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#9B68D5]/35 bg-[#2a2035] px-4 py-3 text-[14px] text-white/88">
      <p>Opened from notifications history.</p>
      <Link href={viewModel.detailReturnHref} className="text-[#c798ff]">
        Back to notifications
      </Link>
    </div>
  );
}

function TestimonyMetaCard({ row }: { row: TextTestimonyRow }) {
  return (
    <div className="rounded-[20px] border border-white/10 px-4 py-4">
      <div className="grid gap-y-6 text-[14px] text-white/90">
        <div>
          <p className="text-white/42">ID</p>
          <p className="mt-2 text-[16px]">{row.testimonyId}</p>
        </div>
        <div>
          <p className="text-white/42">Name</p>
          <p className="mt-2 text-[16px]">{row.name}</p>
        </div>
        <div>
          <p className="text-white/42">Email</p>
          <p className="mt-2 text-[16px]">{row.email}</p>
        </div>
        <div>
          <p className="text-white/42">Status</p>
          <p className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] leading-none ${row.status === "Approved" ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]" : row.status === "Rejected" ? "border-[#ef4335]/25 bg-[#321313] text-[#ef4335]" : "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"}`}>{row.status}</p>
        </div>
        {row.approvedBy ? (
          <div>
            <p className="text-white/42">Approved By</p>
            <p className="mt-2 text-[16px]">{row.approvedBy}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PendingDetailModal({ row, viewModel }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close testimony detail modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[#262626]">
          <Link href={closeHref(viewModel)} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="relative overflow-y-auto px-6 pb-8 pt-2">
          <div className="-mt-2">
            <DetailOriginBanner viewModel={viewModel} />
          </div>
          <div className="-mt-16 flex justify-center">
            <div className="relative h-[102px] w-[102px] overflow-hidden rounded-full border-[6px] border-white bg-white">
              {row.avatarSrc ? <Image src={row.avatarSrc} alt={row.name} fill className="object-contain p-3" /> : null}
            </div>
          </div>

          <div className="mt-8">
            <TestimonyMetaCard row={row} />
          </div>

          <div className="mt-6">
            <h3 className="text-[18px] font-semibold text-white">Miraculous Healing After Prayer</h3>
            <p className="mt-4 text-[17px] leading-[1.55] text-white/82">{row.body}</p>
          </div>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-8 pt-2">
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, reject: row.id })}
            className="inline-flex min-w-[178px] items-center justify-center rounded-[10px] border border-[#ef4335] px-6 py-4 text-[16px] text-[#ef4335]"
          >
            Reject Testimony
          </Link>
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, success: "approve" })}
            className="inline-flex min-w-[178px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white"
          >
            Approve Testimony
          </Link>
        </div>
      </div>
    </div>
  );
}

function ApprovedDetailModal({ row, viewModel }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close approved testimony detail modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[#262626]">
          <Link href={closeHref(viewModel)} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="relative overflow-y-auto px-6 pb-8 pt-2">
          <div className="-mt-2">
            <DetailOriginBanner viewModel={viewModel} />
          </div>
          <div className="-mt-16 flex justify-center">
            <div className="relative h-[102px] w-[102px] overflow-hidden rounded-full border-[6px] border-white bg-white">
              {row.avatarSrc ? <Image src={row.avatarSrc} alt={row.name} fill className="object-contain p-3" /> : null}
            </div>
          </div>

          <div className="mt-8">
            <TestimonyMetaCard row={row} />
          </div>

          <div className="mt-6 rounded-[20px] border border-white/10 px-4 py-4">
            <h3 className="text-[16px] font-semibold text-white">Engagement Analytics</h3>
            <div className="mt-4 grid grid-cols-3 gap-6 text-[14px] text-white/70">
              <div>
                <p>Likes</p>
                <p className="mt-2 text-[16px] text-white">{row.likes}</p>
              </div>
              <div>
                <p>Comments</p>
                <p className="mt-2 text-[16px] text-white">{row.comments}</p>
              </div>
              <div>
                <p>Shares</p>
                <p className="mt-2 text-[16px] text-white">{row.shares}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[18px] font-semibold text-white">Miraculous Healing After Prayer</h3>
            <p className="mt-4 text-[17px] leading-[1.55] text-white/82">{row.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ row, viewModel }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close reject testimony modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Reject Testimony</h2>
          <Link href={closeHref(viewModel)} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <p className="mb-4 text-[16px] text-white/90">Reason for rejection</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Type here..."
            className="min-h-[300px] w-full resize-none rounded-[14px] border border-transparent bg-[#2b2b2b] px-5 py-4 text-[16px] leading-7 text-white outline-none placeholder:text-white/35"
          />
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link
            href={closeHref(viewModel)}
            className="inline-flex min-w-[118px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-5 py-4 text-[16px] text-[#9B68D5]"
          >
            Cancel
          </Link>
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status })}
            className="inline-flex min-w-[118px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-5 py-4 text-[16px] text-white"
          >
            Confirm
          </Link>
        </div>
      </div>
    </div>
  );
}

function DeleteTextTestimonyModal({ viewModel }: { viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete testimony modal" />
      <div className="relative z-10 w-full max-w-[608px] rounded-[24px] bg-[#1f1f1f] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <Link href={closeHref(viewModel)} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
          ×
        </Link>
        <h2 className="text-[28px] font-semibold text-white">Delete Testimony?</h2>
        <p className="mx-auto mt-8 max-w-[520px] text-[17px] leading-[1.5] text-white/78">
          Are you sure you want to delete this testimony? Once deleted, the testimony will be removed from the system. This action cannot be undone.
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">
            Cancel
          </Link>
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] text-white">
            Yes, delete
          </Link>
        </div>
      </div>
    </div>
  );
}

function FilterModal({ viewModel }: { viewModel: TestimoniesViewModel }) {
  const categoryOptions = ["Healing", "Deliverance", "Faith", "Salvation"];
  const sourceOptions = ["You-tube", "Instagram", "TikTok", "Facebook"];
  const isVideo = viewModel.activeTab === "video";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close testimony filter modal" />
      <form action="/testimonies" className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[24px] border border-white/10 bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <input type="hidden" name="tab" value={viewModel.activeTab} />
        <input type="hidden" name="q" value={viewModel.searchQuery} />
        {isVideo ? <input type="hidden" name="videoStatus" value={viewModel.activeVideoStatus} /> : null}
        {viewModel.filterDraft.categoryMenuOpen ? <input type="hidden" name="categoryMenuOpen" value="1" /> : null}
        {viewModel.filterDraft.sourceMenuOpen ? <input type="hidden" name="sourceMenuOpen" value="1" /> : null}
        <div className="border-b border-white/10 px-5 py-4 text-[14px] font-medium text-white">Filter</div>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[14px] text-white">Date Range</p>
            <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, videoStatus: isVideo ? viewModel.activeVideoStatus : null, q: viewModel.searchQuery, filter: true, category: viewModel.filterDraft.category, source: viewModel.filterDraft.source, statusFilter: viewModel.filterDraft.status, categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen, sourceMenuOpen: viewModel.filterDraft.sourceMenuOpen })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-[13px] text-white/78">From</p>
              <div className="flex h-[32px] items-center gap-3 rounded-[8px] bg-[#2a2a2a] px-3 text-[14px] text-white/78">
                <span>🗓</span>
                <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="w-full bg-transparent outline-none placeholder:text-white/35" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-white/78">To</p>
              <div className="flex h-[32px] items-center gap-3 rounded-[8px] bg-[#2a2a2a] px-3 text-[14px] text-white/78">
                <span>🗓</span>
                <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="w-full bg-transparent outline-none placeholder:text-white/35" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] text-white">Category</p>
            <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, videoStatus: isVideo ? viewModel.activeVideoStatus : null, q: viewModel.searchQuery, filter: true, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, source: viewModel.filterDraft.source, statusFilter: viewModel.filterDraft.status })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          <Link
            href={buildTestimoniesHref({
              tab: viewModel.activeTab,
              videoStatus: isVideo ? viewModel.activeVideoStatus : null,
              q: viewModel.searchQuery,
              filter: true,
              from: viewModel.filterDraft.from,
              to: viewModel.filterDraft.to,
              category: viewModel.filterDraft.category,
              source: viewModel.filterDraft.source,
              statusFilter: viewModel.filterDraft.status,
              categoryMenuOpen: !viewModel.filterDraft.categoryMenuOpen,
              sourceMenuOpen: viewModel.filterDraft.sourceMenuOpen,
            })}
            className="flex h-[32px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-3 text-[14px] text-white/78"
          >
            <span>{viewModel.filterDraft.category || "Select"}</span>
            <span className="text-white/82">{viewModel.filterDraft.categoryMenuOpen ? <ChevronDownIcon /> : <ChevronDownIcon />}</span>
          </Link>
          {viewModel.filterDraft.categoryMenuOpen ? (
            <div className="mt-2 overflow-hidden rounded-[8px] border border-white/15 bg-[#1f1f1f]">
              {categoryOptions.map((option) => (
                <Link
                  key={option}
                  href={buildTestimoniesHref({
                    tab: viewModel.activeTab,
                    videoStatus: isVideo ? viewModel.activeVideoStatus : null,
                    q: viewModel.searchQuery,
                    filter: true,
                    from: viewModel.filterDraft.from,
                    to: viewModel.filterDraft.to,
                    category: option,
                    source: viewModel.filterDraft.source,
                    statusFilter: viewModel.filterDraft.status,
                    sourceMenuOpen: viewModel.filterDraft.sourceMenuOpen,
                  })}
                  className="block border-t border-white/10 px-4 py-3 text-[14px] text-white/88 first:border-t-0 hover:bg-white/[0.03]"
                >
                  {option}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {isVideo ? (
          <div className="border-b border-white/10 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] text-white">Source</p>
              <Link href={buildTestimoniesHref({ tab: "video", videoStatus: viewModel.activeVideoStatus, q: viewModel.searchQuery, filter: true, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, category: viewModel.filterDraft.category, categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen })} className="text-[14px] text-[#b27bff]">
                Clear
              </Link>
            </div>
            <Link
              href={buildTestimoniesHref({
                tab: "video",
                videoStatus: viewModel.activeVideoStatus,
                q: viewModel.searchQuery,
                filter: true,
                from: viewModel.filterDraft.from,
                to: viewModel.filterDraft.to,
                category: viewModel.filterDraft.category,
                source: viewModel.filterDraft.source,
                sourceMenuOpen: !viewModel.filterDraft.sourceMenuOpen,
                categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen,
              })}
              className="flex h-[32px] items-center justify-between rounded-[8px] bg-[#2a2a2a] px-3 text-[14px] text-white/78"
            >
              <span>{viewModel.filterDraft.source || "Select"}</span>
              <span className="text-white/82"><ChevronDownIcon /></span>
            </Link>
            {viewModel.filterDraft.sourceMenuOpen ? (
              <div className="mt-2 overflow-hidden rounded-[8px] border border-white/15 bg-[#1f1f1f]">
                {sourceOptions.map((option) => (
                  <Link
                    key={option}
                    href={buildTestimoniesHref({
                      tab: "video",
                      videoStatus: viewModel.activeVideoStatus,
                      q: viewModel.searchQuery,
                      filter: true,
                      from: viewModel.filterDraft.from,
                      to: viewModel.filterDraft.to,
                      category: viewModel.filterDraft.category,
                      source: option,
                      categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen,
                    })}
                    className="block border-t border-white/10 px-4 py-3 text-[14px] text-white/88 first:border-t-0 hover:bg-white/[0.03]"
                  >
                    {option}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="px-5 py-5">
          {!isVideo ? (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] text-white">Approval Status</p>
            <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, filter: true, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to, category: viewModel.filterDraft.category, categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          ) : (
            <p className="mb-1 text-[14px] text-white">Video Filter</p>
          )}
          {!isVideo ? (
          <div className="flex flex-wrap gap-6 text-[14px] text-white/85">
            {(["Pending", "Approved", "Rejected"] as const).map((status) => (
              <label key={status} className="inline-flex items-center gap-2">
                <input type="radio" name="statusFilter" value={status} defaultChecked={viewModel.filterDraft.status === status} className="h-4 w-4 accent-[#9B68D5]" />
                <span>{status}</span>
              </label>
            ))}
          </div>
          ) : (
            <p className="text-[14px] leading-6 text-white/65">Filter uploaded, scheduled, and draft videos by date range, category, and source.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5">
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, videoStatus: isVideo ? viewModel.activeVideoStatus : null, q: viewModel.searchQuery, filter: true })}
            className="inline-flex min-w-[116px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-5 py-4 text-[16px] text-[#9B68D5]"
          >
            Clear All
          </Link>
          <button type="submit" className="inline-flex min-w-[116px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-5 py-4 text-[16px] text-white">
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessModal({ viewModel }: { viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close testimony approved success modal" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
        <p className="mt-10 text-[28px] font-semibold leading-[1.3] text-white">{viewModel.successMessage}</p>
      </div>
    </div>
  );
}

function TestimonySettingsModal({ viewModel }: { viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close testimony settings modal" />
      <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[24px] bg-[#1f1f1f] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Testimony Settings</h2>
          <Link href={closeHref(viewModel)} className="text-white/90" aria-label="Close testimony settings">
            <CloseIcon />
          </Link>
        </div>
        <div className="px-6 py-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[16px] font-medium text-white">Notify admin of new written testimonies</p>
              <p className="mt-2 text-[14px] text-white/65">Admin will receive notifications for new written testimonies posted by users</p>
            </div>
            <span className="relative mt-1 inline-flex h-[24px] w-[48px] rounded-full bg-[#9B68D5]">
              <span className="absolute right-[2px] top-[2px] h-[20px] w-[20px] rounded-full bg-white" />
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">Cancel</Link>
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white">Save Settings</Link>
        </div>
      </div>
    </div>
  );
}

function VideoDetailsModal({ row, viewModel }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel }) {
  const stat = (value: number | null) => (value == null ? 0 : value);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close video details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Video Details</h2>
          <Link href={closeHref(viewModel)} className="text-white/90" aria-label="Close video details">
            <CloseIcon />
          </Link>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <DetailOriginBanner viewModel={viewModel} />
          <div className="overflow-hidden rounded-[20px] bg-[#202020]">
            <div className="relative h-[318px] bg-[#111]">
              <Image src={row.thumbnailSrc} alt={row.title} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center text-[70px] text-white/95">▶</div>
            </div>
            <PlayerControlBar />
          </div>
          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-8 gap-y-5 text-[16px] text-white/90">
            <dt>Title</dt><dd className="font-semibold text-right">{row.title}</dd>
            <dt>Category</dt><dd className="font-semibold text-right">{row.category}</dd>
            <dt>Source</dt><dd className="font-semibold text-right">{row.source === "You-tube" ? "Youtube" : row.source}</dd>
            <dt>{row.status === "Uploaded" ? "Upload Date" : "Status"}</dt>
            <dd className="font-semibold text-right">{row.status === "Uploaded" ? "08/08/24" : <StatusPill status={row.status} />}</dd>
            {row.status === "Uploaded" ? (
              <>
                <dt>Uploaded By</dt><dd className="font-semibold text-right">{row.uploadedBy}</dd>
                <dt>Number of Views</dt><dd className="font-semibold text-right">{stat(row.views)}</dd>
                <dt>Number of Likes</dt><dd className="font-semibold text-right">{stat(row.likes)}</dd>
                <dt>Number of Comment</dt><dd className="font-semibold text-right">{stat(row.comments)}</dd>
                <dt>Number of Shares</dt><dd className="font-semibold text-right">{stat(row.shares)}</dd>
                <dt>Status</dt><dd className="text-right"><StatusPill status={row.status} /></dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );
}

function EditVideoModal({ row, viewModel }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close edit video modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-[#1e1e1e] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Edit Video testimony</h2>
          <Link href={closeHref(viewModel)} className="text-white/90" aria-label="Close edit video">
            <CloseIcon />
          </Link>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <div>
            <p className="mb-3 text-[16px] text-white/90">Title</p>
            <div className="rounded-[10px] bg-[#2a2a2a] px-4 py-4 text-[15px] text-white">{row.title}</div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] text-white/90">Category</p>
            <div className="flex items-center justify-between rounded-[10px] bg-[#2a2a2a] px-4 py-4 text-[15px] text-white">
              <span>{row.category}</span>
              <span className="text-white/85">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          {row.status === "Scheduled" ? (
            <>
              <div className="mt-6">
                <p className="mb-3 text-[16px] text-white/90">Scheduled date</p>
                <div className="flex items-center justify-between rounded-[10px] bg-[#2a2a2a] px-4 py-4 text-[15px] text-white">
                  <span>8/08/2024</span>
                  <span className="text-white/92">
                    <CalendarIcon />
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-[1fr_1fr] gap-6">
                <div>
                  <p className="mb-3 text-[16px] text-white/90">Scheduled Time</p>
                  <div className="flex items-center justify-between rounded-[10px] bg-[#2a2a2a] px-4 py-4 text-[15px] text-white">
                    <span>08:00 PM</span>
                    <span className="text-white/92">
                      <TimeIcon />
                    </span>
                  </div>
                </div>
                <div className="pt-[31px]">
                  <div className="flex items-center justify-between rounded-[10px] bg-[#2a2a2a] px-4 py-4 text-[15px] text-white">
                    <span>PM</span>
                    <span className="text-white/85">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">
            {row.status === "Uploaded" ? "Cancel" : "Upload"}
          </Link>
          <Link href={buildTestimoniesHref({ tab: "video", videoStatus: row.status, success: row.status === "Uploaded" ? null : "upload" })} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white">
            Save Changes
          </Link>
        </div>
      </div>
    </div>
  );
}

function DeleteVideoModal({ row, viewModel }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={closeHref(viewModel)} className="absolute inset-0" aria-label="Close delete video modal" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[#1f1f1f] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <h2 className="text-[28px] font-semibold text-white">Delete Video?</h2>
        <p className="mt-5 text-[16px] leading-8 text-white/72">This video testimony will be removed from the list.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">Cancel</Link>
          <Link href={closeHref(viewModel)} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] text-white">Delete</Link>
        </div>
      </div>
    </div>
  );
}

export function TestimoniesOverlays({ viewModel }: { viewModel: TestimoniesViewModel }) {
  if (viewModel.showSuccess && viewModel.successMessage) {
    return <SuccessModal viewModel={viewModel} />;
  }

  return (
    <>
      {viewModel.showDetails && viewModel.selectedRow?.kind === "text" && viewModel.selectedRow.status === "Pending" ? <PendingDetailModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow?.kind === "text" && viewModel.selectedRow.status !== "Pending" ? <ApprovedDetailModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDetails && viewModel.selectedRow?.kind === "video" ? <VideoDetailsModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showRejectModal && viewModel.selectedRow?.kind === "text" ? <RejectModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showEditModal && viewModel.selectedRow?.kind === "video" ? <EditVideoModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDeleteModal && viewModel.selectedRow?.kind === "video" ? <DeleteVideoModal row={viewModel.selectedRow} viewModel={viewModel} /> : null}
      {viewModel.showDeleteModal && viewModel.selectedRow?.kind === "text" ? <DeleteTextTestimonyModal viewModel={viewModel} /> : null}
      {viewModel.showFilterModal ? <FilterModal viewModel={viewModel} /> : null}
      {viewModel.showSettingsModal ? <TestimonySettingsModal viewModel={viewModel} /> : null}
    </>
  );
}
