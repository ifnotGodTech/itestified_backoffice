"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  TestimoniesViewModel,
  TestimonyCategoryOption,
  TestimonyRow,
  TextTestimonyRow,
  VideoTestimonyRow,
} from "@/features/admin/domain/entities/testimonies";
import { buildTestimoniesHref } from "@/features/admin/presentation/state/testimonies-route-state";

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Approved" || status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : status === "Rejected"
        ? "border-[#ef4335]/25 bg-[#321313] text-[#ef4335]"
        : status === "Scheduled" || status === "Pending"
          ? "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]"
          : "border-white/20 bg-[var(--color-surface-muted)] text-white/70";

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

function closeHref(viewModel: TestimoniesViewModel) {
  return buildTestimoniesHref({
    tab: viewModel.activeTab,
    videoStatus: viewModel.activeTab === "video" ? viewModel.activeVideoStatus : null,
    engagement: viewModel.activeTab === "video" ? viewModel.activeVideoEngagement : null,
    q: viewModel.searchQuery,
    from: viewModel.filterDraft.from,
    to: viewModel.filterDraft.to,
    category: viewModel.filterDraft.category,
    source: viewModel.filterDraft.source,
    statusFilter: viewModel.filterDraft.status,
    origin: viewModel.origin === "notification" ? "notification" : null,
  });
}

function DetailCloseControl({
  viewModel,
  onClose,
  className,
  ariaLabel,
  children,
}: {
  viewModel: TestimoniesViewModel;
  onClose?: () => void;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (onClose) {
    return (
      <button type="button" onClick={onClose} className={className} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }

  return (
    <Link href={closeHref(viewModel)} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function ModalCloseControl({
  onClose,
  className,
  ariaLabel,
  children,
}: {
  onClose: () => void;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClose} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

function DetailOriginBanner({ viewModel }: { viewModel: TestimoniesViewModel }) {
  if (viewModel.origin !== "notification" || !viewModel.detailReturnHref) return null;

  return (
    <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#9B68D5]/35 bg-[#2a2035] px-4 py-3 text-[14px] text-[#ffffff]/88">
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

function ModerationHistoryPanel({ row }: { row: TestimonyRow }) {
  const history = row.moderationHistory ?? [];
  if (history.length === 0) {
    return (
      <div className="mt-6 rounded-[20px] border border-white/10 px-4 py-4">
        <h3 className="text-[16px] font-semibold text-white">Moderation History</h3>
        <p className="mt-3 text-[14px] text-white/65">No moderation actions recorded yet.</p>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-[20px] border border-white/10 px-4 py-4">
      <h3 className="text-[16px] font-semibold text-white">Moderation History</h3>
      <div className="mt-4 space-y-3 text-[13px]">
        {history.map((item) => (
          <div key={item.id} className="rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-3 py-3">
            <p className="text-white/92">
              <span className="capitalize">{item.action.replace("_", " ")}</span> by {item.actor_name ?? "System"}
            </p>
            <p className="mt-1 text-white/65">
              {new Date(item.created_at).toLocaleString()} • {item.from_status} → {item.to_status}
            </p>
            {item.publish_at ? <p className="mt-1 text-white/65">Publish at: {new Date(item.publish_at).toLocaleString()}</p> : null}
            {item.reason ? <p className="mt-1 text-white/75">Reason: {item.reason}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonyAvatar({ avatarSrc, name }: { avatarSrc?: string; name: string }) {
  return (
    <div className="relative h-[102px] w-[102px] overflow-hidden rounded-full border-[6px] border-white bg-white">
      {avatarSrc ? (
        <Image src={avatarSrc} alt={name} fill sizes="72px" className="object-contain p-3" />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute inset-0 h-full w-full p-6 text-[var(--color-surface-muted)]" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 19c0-3.3 3.13-5 7-5s7 1.7 7 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      )}
    </div>
  );
}

function PendingDetailModal({
  row,
  viewModel,
  onClose,
  onActionComplete,
}: {
  row: TextTestimonyRow;
  viewModel: TestimoniesViewModel;
  onClose?: () => void;
  onActionComplete?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function approveTestimony() {
    setSubmitting(true);
    const response = await fetch(`/api/admin/testimonies/${row.id}/approve`, { method: "POST" });
    if (response.ok) {
      onActionComplete?.();
      router.push(
        buildTestimoniesHref({
          tab: viewModel.activeTab,
          q: viewModel.searchQuery,
          statusFilter: viewModel.filterDraft.status,
          success: "approve",
        }),
      );
      return;
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <DetailCloseControl viewModel={viewModel} onClose={onClose} className="absolute inset-0" ariaLabel="Close testimony detail modal">
        <span className="sr-only">Close testimony detail modal</span>
      </DetailCloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[var(--color-surface-muted)]">
          <DetailCloseControl
            viewModel={viewModel}
            onClose={onClose}
            className="absolute right-6 top-6 text-[34px] leading-none text-white/90"
            ariaLabel="Dismiss testimony detail"
          >
            ×
          </DetailCloseControl>
        </div>
        <div className="relative overflow-y-auto px-6 pb-8 pt-2">
          <div className="-mt-2">
            <DetailOriginBanner viewModel={viewModel} />
          </div>
          <div className="-mt-16 flex justify-center">
            <TestimonyAvatar avatarSrc={row.avatarSrc} name={row.name} />
          </div>

          <div className="mt-8">
            <TestimonyMetaCard row={row} />
          </div>

          <div className="mt-6">
            <h3 className="text-[18px] font-semibold text-white">{row.title}</h3>
            <p className="mt-4 text-[17px] leading-[1.55] text-white/82">{row.body}</p>
          </div>
          <ModerationHistoryPanel row={row} />
        </div>
        <div className="grid gap-3 px-6 pb-8 pt-2 sm:grid-cols-3">
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, schedule: row.id })}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] border border-[#f0c400] px-3 py-3 text-center text-[14px] font-medium text-[#f0c400]"
          >
            Schedule
          </Link>
          <Link
            href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, reject: row.id })}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] border border-[#ef4335] px-3 py-3 text-center text-[14px] font-medium text-[#ef4335]"
          >
            Reject Testimony
          </Link>
          <button
            type="button"
            disabled={submitting}
            onClick={approveTestimony}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-[#9B68D5] px-3 py-3 text-center text-[14px] font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Approving..." : "Approve Testimony"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApprovedDetailModal({
  row,
  viewModel,
  onClose,
}: {
  row: TextTestimonyRow;
  viewModel: TestimoniesViewModel;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <DetailCloseControl viewModel={viewModel} onClose={onClose} className="absolute inset-0" ariaLabel="Close approved testimony detail modal">
        <span className="sr-only">Close approved testimony detail modal</span>
      </DetailCloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="relative min-h-[110px] bg-[var(--color-surface-muted)]">
          <DetailCloseControl
            viewModel={viewModel}
            onClose={onClose}
            className="absolute right-6 top-6 text-[34px] leading-none text-white/90"
            ariaLabel="Dismiss approved testimony detail"
          >
            ×
          </DetailCloseControl>
        </div>
        <div className="relative overflow-y-auto px-6 pb-8 pt-2">
          <div className="-mt-2">
            <DetailOriginBanner viewModel={viewModel} />
          </div>
          <div className="-mt-16 flex justify-center">
            <TestimonyAvatar avatarSrc={row.avatarSrc} name={row.name} />
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
            <h3 className="text-[18px] font-semibold text-white">{row.title}</h3>
            <p className="mt-4 text-[17px] leading-[1.55] text-white/82">{row.body}</p>
          </div>
          <ModerationHistoryPanel row={row} />
          {(row.status === "Approved" || row.status === "Scheduled") ? (
            <div className="mt-6 flex justify-end">
              <Link
                href={buildTestimoniesHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, statusFilter: viewModel.filterDraft.status, archive: row.id })}
                className="inline-flex min-w-[160px] items-center justify-center rounded-[10px] border border-[#ef4335] px-5 py-3 text-[14px] text-[#ef4335]"
              >
                Archive Testimony
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ row, viewModel, onClose }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [publishAt, setPublishAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitSchedule() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/testimonies/${row.id}/schedule`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publish_at: publishAt ? new Date(publishAt).toISOString() : "" }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Unable to schedule testimony.");
      setSubmitting(false);
      return;
    }
    router.push(closeHref(viewModel));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close schedule testimony modal">
        <span className="sr-only">Close schedule testimony modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[520px] rounded-[24px] bg-[var(--color-surface-elevated)] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <h2 className="text-[24px] font-semibold text-white">Schedule Testimony</h2>
        <p className="mt-2 text-[14px] text-white/70">Set a future publish date/time for this pending testimony.</p>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(event) => setPublishAt(event.target.value)}
          className="mt-5 h-[44px] w-full rounded-[10px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white outline-none"
        />
        {error ? <p className="mt-3 text-[14px] text-[#ef4335]">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[120px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-4 py-3 text-[14px] text-[#9B68D5]">Cancel</ModalCloseControl>
          <button
            type="button"
            disabled={submitting || !publishAt}
            onClick={submitSchedule}
            className="inline-flex min-w-[120px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-4 py-3 text-[14px] text-white disabled:opacity-60"
          >
            {submitting ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArchiveModal({ row, viewModel, onClose }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitArchive() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/testimonies/${row.id}/archive`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Unable to archive testimony.");
      setSubmitting(false);
      return;
    }
    router.push(closeHref(viewModel));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close archive testimony modal">
        <span className="sr-only">Close archive testimony modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[520px] rounded-[24px] bg-[var(--color-surface-elevated)] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <h2 className="text-[24px] font-semibold text-white">Archive Testimony</h2>
        <p className="mt-2 text-[14px] text-white/70">This removes the testimony from public browse without deleting it.</p>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional reason"
          className="mt-5 min-h-[130px] w-full rounded-[10px] bg-[var(--color-surface-muted)] px-3 py-3 text-[14px] text-white outline-none"
        />
        {error ? <p className="mt-3 text-[14px] text-[#ef4335]">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[120px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-4 py-3 text-[14px] text-[#9B68D5]">Cancel</ModalCloseControl>
          <button
            type="button"
            disabled={submitting}
            onClick={submitArchive}
            className="inline-flex min-w-[120px] items-center justify-center rounded-[10px] bg-[#ef4335] px-4 py-3 text-[14px] text-white disabled:opacity-60"
          >
            {submitting ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ row, viewModel, onClose }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRejection() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/testimonies/${row.id}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Unable to reject testimony.");
      setSubmitting(false);
      return;
    }
    router.push(
      buildTestimoniesHref({
        tab: viewModel.activeTab,
        q: viewModel.searchQuery,
        statusFilter: viewModel.filterDraft.status,
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close reject testimony modal">
        <span className="sr-only">Close reject testimony modal</span>
      </ModalCloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Reject Testimony</h2>
          <ModalCloseControl onClose={onClose} className="text-[34px] leading-none text-white/90" ariaLabel="Close reject testimony modal">
            ×
          </ModalCloseControl>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <p className="mb-4 text-[16px] text-white/90">Reason for rejection</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Type here..."
            className="min-h-[300px] w-full resize-none rounded-[14px] border border-transparent bg-[var(--color-surface-muted)] px-5 py-4 text-[16px] leading-7 text-white outline-none placeholder:text-white/35"
          />
          {error ? <p className="mt-3 text-[14px] text-[#ef4335]">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <ModalCloseControl
            onClose={onClose}
            className="inline-flex min-w-[118px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-5 py-4 text-[16px] text-[#9B68D5]"
          >
            Cancel
          </ModalCloseControl>
          <button
            type="button"
            disabled={submitting}
            onClick={submitRejection}
            className="inline-flex min-w-[118px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-5 py-4 text-[16px] text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteTextTestimonyModal({ row, viewModel, onClose }: { row: TextTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteTestimony() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/testimonies/${row.id}/delete`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Unable to delete testimony.");
      setSubmitting(false);
      return;
    }
    router.push(
      buildTestimoniesHref({
        tab: viewModel.activeTab,
        videoStatus: viewModel.activeTab === "video" ? viewModel.activeVideoStatus : null,
        engagement: viewModel.activeTab === "video" ? viewModel.activeVideoEngagement : null,
        q: viewModel.searchQuery,
        from: viewModel.filterDraft.from,
        to: viewModel.filterDraft.to,
        category: viewModel.filterDraft.category,
        source: viewModel.filterDraft.source,
        statusFilter: viewModel.filterDraft.status,
        success: "delete",
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close delete testimony modal">
        <span className="sr-only">Close delete testimony modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[608px] rounded-[24px] bg-[var(--color-surface-elevated)] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <ModalCloseControl onClose={onClose} className="absolute right-6 top-6 text-[34px] leading-none text-white/90" ariaLabel="Close delete testimony modal">
          ×
        </ModalCloseControl>
        <h2 className="text-[28px] font-semibold text-white">Delete Testimony?</h2>
        <p className="mx-auto mt-8 max-w-[520px] text-[17px] leading-[1.5] text-white/78">
          Are you sure you want to delete this testimony? Once deleted, the testimony will be removed from the system. This action cannot be undone.
        </p>
        {error ? <p className="mt-3 text-[13px] text-[#ef4335]">{error}</p> : null}
        <div className="mt-10 flex justify-center gap-6">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">
            Cancel
          </ModalCloseControl>
          <button
            type="button"
            onClick={deleteTestimony}
            disabled={submitting}
            className="inline-flex min-w-[176px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] text-white disabled:opacity-60"
          >
            {submitting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterModal({
  viewModel,
  onClose,
}: {
  viewModel: TestimoniesViewModel;
  onClose: () => void;
}) {
  const categoryOptions = viewModel.categories.filter((category) => category.isActive);
  const [selectedCategory, setSelectedCategory] = useState(viewModel.filterDraft.category);
  const [selectedSource, setSelectedSource] = useState(viewModel.filterDraft.source);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const selectedCategoryLabel =
    viewModel.categories.find((category) => category.slug === selectedCategory)?.name ??
    selectedCategory;
  const sourceOptions = ["YouTube", "Instagram", "TikTok", "Facebook"];
  const isVideo = viewModel.activeTab === "video";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close testimony filter modal" />
      <form action="/testimonies" className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[24px] border border-white/10 bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <input type="hidden" name="tab" value={viewModel.activeTab} />
        <input type="hidden" name="q" value={viewModel.searchQuery} />
        {isVideo ? <input type="hidden" name="videoStatus" value={viewModel.activeVideoStatus} /> : null}
        {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
        {isVideo && selectedSource ? <input type="hidden" name="source" value={selectedSource} /> : null}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-[14px] font-medium text-white">
          <span>Filter</span>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white" aria-label="Dismiss testimony filter">
            <CloseIcon />
          </button>
        </div>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[14px] text-white">Date Range</p>
            <Link href={buildTestimoniesHref({ tab: viewModel.activeTab, videoStatus: isVideo ? viewModel.activeVideoStatus : null, engagement: isVideo ? viewModel.activeVideoEngagement : null, q: viewModel.searchQuery, filter: true, category: viewModel.filterDraft.category, source: viewModel.filterDraft.source, statusFilter: viewModel.filterDraft.status, categoryMenuOpen: viewModel.filterDraft.categoryMenuOpen, sourceMenuOpen: viewModel.filterDraft.sourceMenuOpen })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-[13px] text-white/78">From</p>
              <div className="flex h-[32px] items-center gap-3 rounded-[8px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white/78">
                <span>🗓</span>
                <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="w-full bg-transparent outline-none placeholder:text-white/35" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] text-white/78">To</p>
              <div className="flex h-[32px] items-center gap-3 rounded-[8px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white/78">
                <span>🗓</span>
                <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="w-full bg-transparent outline-none placeholder:text-white/35" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[14px] text-white">Category</p>
            <button type="button" onClick={() => setSelectedCategory("")} className="text-[14px] text-[#b27bff]">
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setCategoryMenuOpen((open) => !open);
              setSourceMenuOpen(false);
            }}
            className="flex h-[32px] items-center justify-between rounded-[8px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white/78"
          >
            <span>{selectedCategoryLabel || "Select"}</span>
            <span className="text-white/82"><ChevronDownIcon /></span>
          </button>
          {categoryMenuOpen ? (
            <div className="mt-2 overflow-hidden rounded-[8px] border border-white/15 bg-[var(--color-surface-elevated)]">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(option.slug);
                    setCategoryMenuOpen(false);
                  }}
                  className="block w-full border-t border-white/10 px-4 py-3 text-left text-[14px] text-white/88 first:border-t-0 hover:bg-white/[0.03]"
                >
                  {option.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {isVideo ? (
          <div className="border-b border-white/10 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[14px] text-white">Source</p>
              <button type="button" onClick={() => setSelectedSource("")} className="text-[14px] text-[#b27bff]">
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setSourceMenuOpen((open) => !open);
                setCategoryMenuOpen(false);
              }}
              className="flex h-[32px] items-center justify-between rounded-[8px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white/78"
            >
              <span>{selectedSource || "Select"}</span>
              <span className="text-white/82"><ChevronDownIcon /></span>
            </button>
            {sourceMenuOpen ? (
              <div className="mt-2 overflow-hidden rounded-[8px] border border-white/15 bg-[var(--color-surface-elevated)]">
                {sourceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedSource(option);
                      setSourceMenuOpen(false);
                    }}
                    className="block w-full border-t border-white/10 px-4 py-3 text-left text-[14px] text-white/88 first:border-t-0 hover:bg-white/[0.03]"
                  >
                    {option}
                  </button>
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
            href={buildTestimoniesHref({ tab: viewModel.activeTab, videoStatus: isVideo ? viewModel.activeVideoStatus : null, engagement: isVideo ? viewModel.activeVideoEngagement : null, q: viewModel.searchQuery, filter: true })}
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

function SuccessModal({ viewModel, onClose }: { viewModel: TestimoniesViewModel; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close testimony approved success modal">
        <span className="sr-only">Close testimony approved success modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface-elevated)] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[102px] w-[102px] items-center justify-center rounded-full bg-[#9B68D5] text-[62px] text-white">✓</div>
        <p className="mt-10 text-[28px] font-semibold leading-[1.3] text-white">{viewModel.successMessage}</p>
      </div>
    </div>
  );
}

async function readApiMessage(response: Response, fallback: string): Promise<string> {
  const payload = (await response.json().catch(() => ({}))) as { message?: string };
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  return fallback;
}

function TestimonySettingsModal({ viewModel, onClose }: { viewModel: TestimoniesViewModel; onClose: () => void }) {
  const [categories, setCategories] = useState<TestimonyCategoryOption[]>(viewModel.categories);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  function buildDefaultDescription(categoryName: string): string {
    return `Watch and read ${categoryName} testimonies. Be blessed, edified, and receive yours.`;
  }

  async function createCategory() {
    const name = newName.trim();
    if (!name) return;
    const description = newDescription.trim() || buildDefaultDescription(name);
    setBusyId(-1);
    setMessage(null);
    const response = await fetch("/api/admin/testimonies/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to create category."));
      setBusyId(null);
      return;
    }
    const created = (await response.json()) as {
      id: number;
      name: string;
      slug: string;
      description?: string;
      is_active: boolean;
    };
    setCategories((previous) => [
      ...previous,
      {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description ?? "",
        isActive: created.is_active,
      },
    ]);
    setNewName("");
    setNewDescription("");
    setBusyId(null);
    setMessageTone("success");
    setMessage("Category created successfully.");
  }

  async function updateCategory(category: TestimonyCategoryOption, updatedName: string, updatedDescription: string) {
    const trimmedName = updatedName.trim();
    const trimmedDescription = updatedDescription.trim() || buildDefaultDescription(trimmedName);
    if (!trimmedName) return;
    if (trimmedName === category.name && trimmedDescription === (category.description ?? "").trim()) {
      setEditingId(null);
      return;
    }
    setBusyId(category.id);
    setMessage(null);
    const response = await fetch(`/api/admin/testimonies/categories/${category.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: trimmedName, description: trimmedDescription }),
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to update category."));
      setBusyId(null);
      return;
    }
    const updated = (await response.json()) as {
      id: number;
      name: string;
      slug: string;
      description?: string;
      is_active: boolean;
    };
    setCategories((previous) =>
      previous.map((row) =>
        row.id === updated.id
          ? {
              id: updated.id,
              name: updated.name,
              slug: updated.slug,
              description: updated.description ?? "",
              isActive: updated.is_active,
            }
          : row,
      ),
    );
    setEditingId(null);
    setBusyId(null);
    setMessageTone("success");
    setMessage("Category updated successfully.");
  }

  async function toggleCategory(category: TestimonyCategoryOption) {
    setBusyId(category.id);
    setMessage(null);
    const response = await fetch(`/api/admin/testimonies/categories/${category.id}/activation`, {
      method: category.isActive ? "DELETE" : "POST",
    });
    if (!response.ok) {
      setMessageTone("error");
      setMessage(await readApiMessage(response, "Unable to update category status."));
      setBusyId(null);
      return;
    }
    const updated = (await response.json()) as {
      id: number;
      name: string;
      slug: string;
      description?: string;
      is_active: boolean;
    };
    setCategories((previous) =>
      previous.map((row) =>
        row.id === updated.id
          ? {
              id: updated.id,
              name: updated.name,
              slug: updated.slug,
              description: updated.description ?? "",
              isActive: updated.is_active,
            }
          : row,
      ),
    );
    setBusyId(null);
    setMessageTone("success");
    setMessage(category.isActive ? "Category deactivated successfully." : "Category reactivated successfully.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close testimony settings modal">
        <span className="sr-only">Close testimony settings modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Testimony Settings</h2>
          <ModalCloseControl onClose={onClose} className="text-white/90" ariaLabel="Close testimony settings">
            <CloseIcon />
          </ModalCloseControl>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[16px] font-medium text-white">Notify admin of new written testimonies</p>
              <p className="mt-2 text-[14px] text-white/65">Admin will receive notifications for new written testimonies posted by users</p>
            </div>
            <span className="relative mt-1 inline-flex h-[24px] w-[48px] rounded-full bg-[#9B68D5]">
              <span className="absolute right-[2px] top-[2px] h-[20px] w-[20px] rounded-full bg-white" />
            </span>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-[20px] font-semibold text-white">Manage Categories</h3>
            <p className="mt-2 text-[14px] text-white/65">Create, rename, deactivate, and reactivate testimony categories.</p>
            {message ? (
              <p className={`mt-3 text-[13px] ${messageTone === "error" ? "text-[#ef4335]" : "text-[#6BFFB4]"}`}>
                {message}
              </p>
            ) : null}
            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Category name"
                className="h-[44px] rounded-[10px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white outline-none"
              />
              <input
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Description (optional)"
                className="h-[44px] rounded-[10px] bg-[var(--color-surface-muted)] px-3 text-[14px] text-white outline-none"
              />
              <button
                type="button"
                onClick={createCategory}
                disabled={busyId === -1 || !newName.trim()}
                className="inline-flex h-[44px] min-w-[120px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-4 text-[14px] text-white disabled:opacity-60"
              >
                {busyId === -1 ? "Creating..." : "Add"}
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {sortedCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-[12px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-3">
                  <div>
                    {editingId === category.id ? (
                      <div className="space-y-2">
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="h-[36px] w-[240px] rounded-[8px] bg-[var(--color-surface-elevated)] px-3 text-[13px] text-white outline-none"
                          placeholder="Category name"
                        />
                        <input
                          value={editingDescription}
                          onChange={(event) => setEditingDescription(event.target.value)}
                          className="h-[36px] w-[300px] rounded-[8px] bg-[var(--color-surface-elevated)] px-3 text-[13px] text-white outline-none"
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-[14px] text-white">{category.name}</p>
                        <p className="text-[12px] text-white/60">
                          {category.isActive ? "Active" : "Inactive"}
                          {category.description ? ` • ${category.description}` : ""}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingId === category.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateCategory(category, editingName, editingDescription)}
                          disabled={busyId === category.id || !editingName.trim()}
                          className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/85 disabled:opacity-50"
                        >
                          {busyId === category.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={busyId === category.id}
                          className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/70 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                          setEditingDescription(category.description ?? "");
                        }}
                        disabled={busyId === category.id}
                        className="rounded-[8px] border border-white/20 px-3 py-1 text-[12px] text-white/85 disabled:opacity-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      disabled={busyId === category.id || editingId === category.id}
                      className="rounded-[8px] border border-[#9B68D5] px-3 py-1 text-[12px] text-[#cba7ff] disabled:opacity-50"
                    >
                      {busyId === category.id ? "Saving..." : category.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">Cancel</ModalCloseControl>
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white">Save Settings</ModalCloseControl>
        </div>
      </div>
    </div>
  );
}

function VideoDetailsModal({
  row,
  viewModel,
  onClose,
}: {
  row: VideoTestimonyRow;
  viewModel: TestimoniesViewModel;
  onClose?: () => void;
}) {
  const stat = (value: number | null) => (value == null ? 0 : value);
  const hasPlayableVideo = Boolean(row.videoUrl?.trim());
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <DetailCloseControl viewModel={viewModel} onClose={onClose} className="absolute inset-0" ariaLabel="Close video details modal">
        <span className="sr-only">Close video details modal</span>
      </DetailCloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Video Details</h2>
          <DetailCloseControl viewModel={viewModel} onClose={onClose} className="text-white/90" ariaLabel="Close video details">
            <CloseIcon />
          </DetailCloseControl>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <DetailOriginBanner viewModel={viewModel} />
          <div className="overflow-hidden rounded-[20px] bg-[var(--color-surface-muted)]">
            <div className="relative h-[318px] bg-[var(--color-surface-elevated)]">
              {hasPlayableVideo ? (
                <video
                  controls
                  preload="metadata"
                  poster={row.thumbnailSrc}
                  className="h-full w-full bg-black object-contain"
                >
                  <source src={row.videoUrl} />
                  Your browser does not support HTML5 video playback.
                </video>
              ) : (
                <>
                  <Image src={row.thumbnailSrc} alt={row.title} fill sizes="240px" className="object-cover opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] text-white/92">
                    Video playback unavailable for this testimony.
                  </div>
                </>
              )}
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-8 gap-y-5 text-[16px] text-white/90">
            <dt>Title</dt><dd className="font-semibold text-right">{row.title}</dd>
            <dt>Category</dt><dd className="font-semibold text-right">{row.category}</dd>
            <dt>Source</dt><dd className="font-semibold text-right">{row.source === "You-tube" ? "Youtube" : row.source}</dd>
            <dt>Video URL</dt><dd className="max-w-[280px] truncate text-right text-[14px] text-white/75">{row.videoUrl || "Not available"}</dd>
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

function EditVideoModal({ row, viewModel, onClose }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(row.title);
  const [categoryId, setCategoryId] = useState<string>(() => {
    const matchedCategory = viewModel.categories.find((category) => category.name === row.category);
    return matchedCategory ? String(matchedCategory.id) : "";
  });
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDraft = row.status === "Drafts";

  async function saveChanges() {
    setSubmitting(true);
    setError(null);
    const payload: Record<string, string> = {
      title: title.trim(),
    };
    if (categoryId) {
      payload.category_id = categoryId;
    }
    if (row.status === "Scheduled" && scheduledPublishAt.trim()) {
      const parsed = new Date(scheduledPublishAt);
      if (!Number.isNaN(parsed.getTime())) {
        payload.scheduled_publish_at = parsed.toISOString();
      }
    }
    const response = await fetch(`/api/admin/testimonies/${row.id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const responsePayload = (await response.json().catch(() => ({}))) as {
        message?: string;
        title?: string[];
        category_id?: string[];
        scheduled_publish_at?: string[];
      };
      setError(
        responsePayload.message ||
          responsePayload.title?.[0] ||
          responsePayload.category_id?.[0] ||
          responsePayload.scheduled_publish_at?.[0] ||
          "Unable to update video testimony.",
      );
      setSubmitting(false);
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
        statusFilter: viewModel.filterDraft.status,
        success: "edit",
      }),
    );
  }

  async function uploadNow() {
    setSubmitting(true);
    setError(null);
    const savePayload: Record<string, string> = {
      title: title.trim(),
    };
    if (categoryId) {
      savePayload.category_id = categoryId;
    }
    const saveResponse = await fetch(`/api/admin/testimonies/${row.id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savePayload),
    });
    if (!saveResponse.ok) {
      const responsePayload = (await saveResponse.json().catch(() => ({}))) as {
        message?: string;
        title?: string[];
        category_id?: string[];
      };
      setError(
        responsePayload.message ||
          responsePayload.title?.[0] ||
          responsePayload.category_id?.[0] ||
          "Unable to update video testimony before upload.",
      );
      setSubmitting(false);
      return;
    }

    const response = await fetch(`/api/admin/testimonies/${row.id}/upload-now`, {
      method: "POST",
    });
    if (!response.ok) {
      const responsePayload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setError(responsePayload.message || "Unable to upload draft video now.");
      setSubmitting(false);
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
        statusFilter: viewModel.filterDraft.status,
        success: "upload",
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close edit video modal">
        <span className="sr-only">Close edit video modal</span>
      </ModalCloseControl>
      <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-[var(--color-surface-elevated)] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-[28px] font-semibold text-white">Edit Video testimony</h2>
          <ModalCloseControl onClose={onClose} className="text-white/90" ariaLabel="Close edit video">
            <CloseIcon />
          </ModalCloseControl>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <div>
            <p className="mb-3 text-[16px] text-white/90">Title</p>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-4 text-[15px] text-white outline-none ring-[#9B68D5]/50 focus:ring-2"
            />
          </div>
          <div className="mt-6">
            <p className="mb-3 text-[16px] text-white/90">Category</p>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full appearance-none rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-4 pr-10 text-[15px] text-white outline-none ring-[#9B68D5]/50 focus:ring-2"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {viewModel.categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/85">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          {row.status === "Scheduled" ? (
            <>
              <div className="mt-6">
                <p className="mb-3 text-[16px] text-white/90">Scheduled date</p>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledPublishAt}
                    onChange={(event) => setScheduledPublishAt(event.target.value)}
                    className="w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-4 py-4 pr-10 text-[15px] text-white outline-none ring-[#9B68D5]/50 focus:ring-2"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/92">
                    <CalendarIcon />
                  </span>
                </div>
              </div>
            </>
          ) : null}
          {error ? <p className="mt-4 text-[13px] text-[#ef4335]">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-4 px-6 pb-6 pt-2">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">
            Cancel
          </ModalCloseControl>
          {isDraft ? (
            <button
              type="button"
              onClick={uploadNow}
              disabled={submitting}
              className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Upload"}
            </button>
          ) : (
            <button
              type="button"
              onClick={saveChanges}
              disabled={submitting}
              className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[16px] text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteVideoModal({ row, viewModel, onClose }: { row: VideoTestimonyRow; viewModel: TestimoniesViewModel; onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteVideo() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/testimonies/${row.id}/delete`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "Unable to delete video testimony.");
      setSubmitting(false);
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
        statusFilter: viewModel.filterDraft.status,
        success: "delete",
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <ModalCloseControl onClose={onClose} className="absolute inset-0" ariaLabel="Close delete video modal">
        <span className="sr-only">Close delete video modal</span>
      </ModalCloseControl>
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[var(--color-surface-elevated)] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <h2 className="text-[28px] font-semibold text-white">Delete Video?</h2>
        <p className="mt-5 text-[16px] leading-8 text-white/72">This video testimony will be removed from the list.</p>
        {error ? <p className="mt-3 text-[13px] text-[#ef4335]">{error}</p> : null}
        <div className="mt-8 flex justify-center gap-4">
          <ModalCloseControl onClose={onClose} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[16px] text-[#9B68D5]">Cancel</ModalCloseControl>
          <button
            type="button"
            onClick={deleteVideo}
            disabled={submitting}
            className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[16px] text-white disabled:opacity-60"
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TestimoniesOverlays({
  viewModel,
  showFilterModal = false,
  onCloseFilterModal,
  detailRow,
  onCloseDetailModal,
  onActionComplete,
}: {
  viewModel: TestimoniesViewModel;
  showFilterModal?: boolean;
  onCloseFilterModal?: () => void;
  detailRow?: TestimonyRow | null;
  onCloseDetailModal?: () => void;
  onActionComplete?: () => void;
}) {
  const [dismissedOverlayKey, setDismissedOverlayKey] = useState<string | null>(null);
  const selectedDetailRow = detailRow ?? viewModel.selectedRow;
  const currentSearch = typeof window === "undefined" ? "" : window.location.search;
  const detailOverlayKey = selectedDetailRow ? `view:${selectedDetailRow.id}` : "view";
  const showDetails = (Boolean(detailRow) || viewModel.showDetails) && !isDismissed(detailOverlayKey, "view");
  const closeDetails = detailRow ? onCloseDetailModal : () => dismissRouteOverlay(detailOverlayKey);

  function isDismissed(key: string, paramName: string) {
    return dismissedOverlayKey === key && !currentSearch.includes(`${paramName}=`);
  }

  function dismissRouteOverlay(key: string) {
    setDismissedOverlayKey(key);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", closeHref(viewModel));
    }
  }

  function closeFilterModal() {
    if (viewModel.showFilterModal) {
      dismissRouteOverlay("filter");
      return;
    }
    onCloseFilterModal?.();
  }

  if (viewModel.showSuccess && viewModel.successMessage && !isDismissed(`success:${viewModel.successMessage}`, "success")) {
    return <SuccessModal viewModel={viewModel} onClose={() => dismissRouteOverlay(`success:${viewModel.successMessage}`)} />;
  }

  const rejectKey = viewModel.selectedRow ? `reject:${viewModel.selectedRow.id}` : "reject";
  const scheduleKey = viewModel.selectedRow ? `schedule:${viewModel.selectedRow.id}` : "schedule";
  const archiveKey = viewModel.selectedRow ? `archive:${viewModel.selectedRow.id}` : "archive";
  const editKey = viewModel.selectedRow ? `edit:${viewModel.selectedRow.id}` : "edit";
  const deleteKey = viewModel.selectedRow ? `remove:${viewModel.selectedRow.id}` : "remove";

  return (
    <>
      {showDetails && selectedDetailRow?.kind === "text" && selectedDetailRow.status === "Pending" ? <PendingDetailModal row={selectedDetailRow} viewModel={viewModel} onClose={closeDetails} onActionComplete={onActionComplete} /> : null}
      {showDetails && selectedDetailRow?.kind === "text" && selectedDetailRow.status !== "Pending" ? <ApprovedDetailModal row={selectedDetailRow} viewModel={viewModel} onClose={closeDetails} /> : null}
      {showDetails && selectedDetailRow?.kind === "video" ? <VideoDetailsModal row={selectedDetailRow} viewModel={viewModel} onClose={closeDetails} /> : null}
      {viewModel.showRejectModal && viewModel.selectedRow?.kind === "text" && !isDismissed(rejectKey, "reject") ? <RejectModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(rejectKey)} /> : null}
      {viewModel.showScheduleModal && viewModel.selectedRow?.kind === "text" && !isDismissed(scheduleKey, "schedule") ? <ScheduleModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(scheduleKey)} /> : null}
      {viewModel.showArchiveModal && viewModel.selectedRow?.kind === "text" && !isDismissed(archiveKey, "archive") ? <ArchiveModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(archiveKey)} /> : null}
      {viewModel.showEditModal && viewModel.selectedRow?.kind === "video" && !isDismissed(editKey, "edit") ? <EditVideoModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(editKey)} /> : null}
      {viewModel.showDeleteModal && viewModel.selectedRow?.kind === "video" && !isDismissed(deleteKey, "remove") ? <DeleteVideoModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(deleteKey)} /> : null}
      {viewModel.showDeleteModal && viewModel.selectedRow?.kind === "text" && !isDismissed(deleteKey, "remove") ? <DeleteTextTestimonyModal row={viewModel.selectedRow} viewModel={viewModel} onClose={() => dismissRouteOverlay(deleteKey)} /> : null}
      {(viewModel.showFilterModal && !isDismissed("filter", "filter")) || showFilterModal ? <FilterModal viewModel={viewModel} onClose={closeFilterModal} /> : null}
      {viewModel.showSettingsModal && !isDismissed("settings", "settings") ? <TestimonySettingsModal viewModel={viewModel} onClose={() => dismissRouteOverlay("settings")} /> : null}
    </>
  );
}
