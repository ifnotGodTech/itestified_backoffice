"use client";

import { useState } from "react";
import type { ActiveBroadcastRow } from "@/features/admin/domain/entities/live-broadcasts";

export function EndBroadcastModal({
  broadcast,
  onClose,
  onEnded,
}: {
  broadcast: ActiveBroadcastRow;
  onClose: () => void;
  onEnded: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmedReason = reason.trim();

  async function handleConfirm() {
    if (!trimmedReason || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/live-broadcasts/${broadcast.id}/end`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: trimmedReason }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not end this broadcast. Please try again.");
        setSubmitting(false);
        return;
      }
      onEnded();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close end broadcast modal" />
      <div className="relative z-10 w-full max-w-[520px] rounded-[20px] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-5 text-[28px] leading-none text-white/90"
          aria-label="Close end broadcast modal"
        >
          ×
        </button>
        <h2 className="text-[18px] font-semibold text-white">End Broadcast</h2>
        <p className="mt-2 text-[14px] text-white/55">
          This immediately ends {broadcast.ministryName}&apos;s broadcast for every viewer. A reason is required and
          the Ministry will be notified.
        </p>
        <div className="mt-5 rounded-[10px] border border-white/15 px-4 py-4">
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-[14px]">
            <dt className="text-white/45">Ministry</dt>
            <dd className="text-white">{broadcast.ministryName}</dd>
            <dt className="text-white/45">Title</dt>
            <dd className="text-white">{broadcast.title}</dd>
          </dl>
        </div>
        <div className="mt-5">
          <label className="mb-2 block text-[14px] text-white" htmlFor="end-broadcast-reason">
            Reason<span className="text-[#ef4335]">*</span>
          </label>
          <textarea
            id="end-broadcast-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this broadcast is being ended"
            rows={3}
            className="w-full resize-none rounded-[8px] bg-[var(--color-surface-muted)] px-4 py-3 text-[14px] text-white/85 outline-none placeholder:text-white/28"
          />
        </div>
        {error ? <p className="mt-3 text-[13px] text-[#ef4335]">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-[42px] min-w-[120px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 text-[14px] text-[#9B68D5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!trimmedReason || submitting}
            className="inline-flex h-[42px] min-w-[160px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Ending…" : "End Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
}
