"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildPlaylistsHref } from "@/features/admin/data/services/get-playlists-view-model";
import type { PlaylistDetail, PlaylistTakedownAction } from "@/features/admin/domain/entities/playlists";

const actionCopy: Record<
  PlaylistTakedownAction,
  { icon: string; title: string; description: string; toneClass: string; confirmLabel: string; confirmClass: string }
> = {
  force_private: {
    icon: "🔒",
    title: "Force Private",
    description: "Drops off their profile immediately. Playlist and contents stay fully intact — a quiet correction, not a deletion.",
    toneClass: "border-[#ff8d28] bg-[#ff8d28]/10",
    confirmLabel: "Force Private",
    confirmClass: "bg-[#ff8d28] text-[#241300]",
  },
  delete: {
    icon: "🗑️",
    title: "Delete Permanently",
    description: "Hard delete, no undo. Testimonies inside are untouched; any clone someone else made stays independent.",
    toneClass: "border-[#e53935] bg-[#e53935]/10",
    confirmLabel: "Delete Permanently",
    confirmClass: "bg-[#e53935] text-white",
  },
};

export function PlaylistTakedownModal({ playlist }: { playlist: PlaylistDetail }) {
  const router = useRouter();
  const [action, setAction] = useState<PlaylistTakedownAction>("force_private");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeHref = buildPlaylistsHref({ view: playlist.id });

  function close() {
    router.push(closeHref);
  }

  async function confirm() {
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/admin/playlists/${playlist.id}/takedown`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string; reason?: string[] };
      setError(payload.message ?? payload.reason?.[0] ?? "Unable to take down this playlist.");
      setSubmitting(false);
      return;
    }
    router.push(buildPlaylistsHref({}));
    router.refresh();
  }

  const copy = actionCopy[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <button
        type="button"
        onClick={close}
        aria-label="Close take-down modal"
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[20px] bg-[var(--color-surface-elevated)] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-[17px] font-bold text-white">Take down this playlist?</h2>
          <p className="mt-1 text-[12px] text-white/50">
            {playlist.title} · owned by {playlist.ownerName}
          </p>
        </div>

        <div className="px-6 py-5">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-white/50">Choose an action</span>
          <div className="mb-4 flex gap-2.5">
            {(Object.keys(actionCopy) as PlaylistTakedownAction[]).map((key) => {
              const isSelected = key === action;
              const item = actionCopy[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAction(key)}
                  className={`flex-1 rounded-[12px] border-[1.5px] p-3 text-left transition-colors ${
                    isSelected ? item.toneClass : "border-white/12 bg-transparent"
                  }`}
                >
                  <div className="mb-2 text-[18px]">{item.icon}</div>
                  <div className={`mb-1 text-[12.5px] font-bold ${isSelected ? "text-white" : "text-white/80"}`}>{item.title}</div>
                  <div className="text-[10.5px] leading-[1.4] text-white/50">{item.description}</div>
                </button>
              );
            })}
          </div>

          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-white/50" htmlFor="takedown-reason">
            Reason (required)
          </label>
          <textarea
            id="takedown-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Contains graphic descriptions flagged under community guideline 4.2…"
            className="min-h-[84px] w-full resize-none rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] px-3.5 py-3 text-[12.5px] text-white outline-none placeholder:text-white/35 focus:border-[var(--color-primary)]"
          />

          {error ? <p className="mt-2 text-[12.5px] text-[#ef4335]">{error}</p> : null}

          <div className="mt-3 flex gap-2 rounded-[10px] bg-[var(--color-surface-panel)] px-3 py-2.5 text-[11.5px] leading-[1.5] text-white/70">
            <span>📩</span>
            <span>{playlist.ownerName} will be notified with this reason — same as testimony rejection. Never a silent takedown.</span>
          </div>
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-[10px] border border-white/15 py-[11px] text-[13px] font-bold text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={confirm}
            className={`flex-1 rounded-[10px] py-[11px] text-[13px] font-bold disabled:opacity-60 ${copy.confirmClass}`}
          >
            {submitting ? "Saving…" : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
