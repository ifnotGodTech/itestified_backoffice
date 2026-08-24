"use client";

import { useEffect, useMemo, useState } from "react";

type AudioPolicy = {
  max_file_size_bytes: number;
  max_duration_ms: number;
  allowed_content_types: string[];
  updated_at: string;
  updated_by_email?: string | null;
  updated_by_name?: string | null;
};

type FormatKey = "aac" | "m4a" | "mp3";

const FORMAT_OPTIONS: Array<{ key: FormatKey; label: string; detail: string; contentTypes: string[] }> = [
  { key: "aac", label: "AAC", detail: "Efficient voice recording", contentTypes: ["audio/aac"] },
  { key: "m4a", label: "M4A", detail: "Recommended for mobile", contentTypes: ["audio/mp4", "audio/x-m4a"] },
  { key: "mp3", label: "MP3", detail: "Broad device support", contentTypes: ["audio/mpeg", "audio/mp3"] },
];

function selectedFormats(contentTypes: string[]): Set<FormatKey> {
  const allowed = new Set(contentTypes);
  return new Set(FORMAT_OPTIONS.filter((option) => option.contentTypes.some((value) => allowed.has(value))).map((option) => option.key));
}

function apiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  for (const value of Object.values(payload as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M5 5 15 15M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function SoundMark() {
  return (
    <span className="flex h-12 w-12 items-center justify-center gap-[3px] rounded-[15px] border border-[#c49aff]/25 bg-[#9B68D5]/15 text-[#d7b8ff]" aria-hidden="true">
      {[12, 22, 30, 18, 26].map((height, index) => <i key={index} className="w-[3px] rounded-full bg-current" style={{ height }} />)}
    </span>
  );
}

export function AudioUploadPolicyModal({ onClose }: { onClose: () => void }) {
  const [policy, setPolicy] = useState<AudioPolicy | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState("50");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [formats, setFormats] = useState<Set<FormatKey>>(new Set(["aac", "m4a", "mp3"]));
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/testimonies/audio-upload-policy", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as AudioPolicy;
        if (!response.ok) throw new Error(apiMessage(payload, "Unable to load the audio policy."));
        if (cancelled) return;
        setPolicy(payload);
        setFileSizeMb(String(payload.max_file_size_bytes / (1024 * 1024)));
        setDurationMinutes(String(payload.max_duration_ms / 60000));
        setFormats(selectedFormats(payload.allowed_content_types));
        setPhase("ready");
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setMessage(error.message);
          setMessageTone("error");
          setPhase("error");
        }
      });
    return () => { cancelled = true; };
  }, []);

  const validationError = useMemo(() => {
    const size = Number(fileSizeMb);
    const duration = Number(durationMinutes);
    if (!Number.isFinite(size) || size < 1 || size > 500) return "File size must be between 1 MB and 500 MB.";
    if (!Number.isFinite(duration) || duration < 1 || duration > 120) return "Duration must be between 1 and 120 minutes.";
    if (formats.size === 0) return "Select at least one accepted audio format.";
    return null;
  }, [durationMinutes, fileSizeMb, formats]);

  function toggleFormat(key: FormatKey) {
    setFormats((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setMessage(null);
  }

  async function savePolicy() {
    if (validationError) return;
    setSaving(true);
    setMessage(null);
    const allowedContentTypes = FORMAT_OPTIONS.filter((option) => formats.has(option.key)).flatMap((option) => option.contentTypes);
    const response = await fetch("/api/admin/testimonies/audio-upload-policy", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        max_file_size_bytes: Math.round(Number(fileSizeMb) * 1024 * 1024),
        max_duration_ms: Math.round(Number(durationMinutes) * 60000),
        allowed_content_types: allowedContentTypes,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as AudioPolicy;
    if (!response.ok) {
      setMessageTone("error");
      setMessage(apiMessage(payload, "Unable to update the audio policy."));
      setSaving(false);
      setConfirming(false);
      return;
    }
    setPolicy(payload);
    setFormats(selectedFormats(payload.allowed_content_types));
    setMessageTone("success");
    setMessage("Audio upload policy updated. New uploads will use these limits.");
    setSaving(false);
    setConfirming(false);
  }

  const updatedLabel = policy?.updated_at ? new Date(policy.updated_at).toLocaleString() : "Not updated yet";
  const updatedBy = policy?.updated_by_name || policy?.updated_by_email || "System default";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-4 backdrop-blur-[2px] sm:px-6 sm:py-8">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="Close audio upload policy"><span className="sr-only">Close audio upload policy</span></button>
      <section className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[880px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#17131d] shadow-[0_30px_100px_rgba(0,0,0,0.7)]" aria-labelledby="audio-policy-title">
        <header className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_12%_-20%,rgba(155,104,213,0.42),transparent_45%),linear-gradient(120deg,#251c2f,#17131d)] px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4"><SoundMark /><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#cda4ff]">Submission controls</p><h2 id="audio-policy-title" className="mt-1 text-[25px] font-semibold text-white sm:text-[29px]">Audio upload policy</h2><p className="mt-1 text-[13px] text-white/55">Define the upload envelope for future Premium submissions.</p></div></div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/15 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Dismiss audio upload policy"><CloseIcon /></button>
          </div>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {phase === "loading" ? <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <span key={item} className="h-28 animate-pulse rounded-[18px] bg-white/[0.05]" />)}</div> : null}
          {phase === "error" ? <div className="rounded-[16px] border border-[#ef4335]/25 bg-[#321313] p-5 text-[14px] text-[#ef7066]">{message}</div> : null}
          {phase === "ready" ? <>
            <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
              <div>
                <div className="flex items-end justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">Accepted formats</p><h3 className="mt-1 text-[18px] font-semibold text-white">What can members upload?</h3></div><p className="text-[12px] text-white/40">Choose one or more</p></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {FORMAT_OPTIONS.map((option) => {
                    const selected = formats.has(option.key);
                    return <button key={option.key} type="button" aria-pressed={selected} onClick={() => toggleFormat(option.key)} className={`relative rounded-[17px] border p-4 text-left transition ${selected ? "border-[#b887f1]/55 bg-[#9B68D5]/14 shadow-[inset_0_0_24px_rgba(155,104,213,0.08)]" : "border-white/10 bg-white/[0.025] hover:border-white/20"}`}><span className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border text-[11px] ${selected ? "border-[#b887f1] bg-[#9B68D5] text-white" : "border-white/20 text-transparent"}`}>✓</span><span className="text-[17px] font-semibold text-white">{option.label}</span><span className="mt-2 block text-[11px] leading-4 text-white/45">{option.detail}</span></button>;
                  })}
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="rounded-[17px] border border-white/10 bg-white/[0.025] p-4"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Maximum file size</span><span className="mt-3 flex items-center"><input aria-label="Maximum file size in MB" type="number" min="1" max="500" step="1" value={fileSizeMb} onChange={(event) => { setFileSizeMb(event.target.value); setMessage(null); }} className="min-w-0 flex-1 bg-transparent text-[30px] font-semibold tabular-nums text-white outline-none" /><span className="text-[13px] font-medium text-[#cda4ff]">MB</span></span><span className="mt-2 block text-[11px] text-white/38">Allowed range: 1–500 MB</span></label>
                  <label className="rounded-[17px] border border-white/10 bg-white/[0.025] p-4"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Maximum duration</span><span className="mt-3 flex items-center"><input aria-label="Maximum duration in minutes" type="number" min="1" max="120" step="1" value={durationMinutes} onChange={(event) => { setDurationMinutes(event.target.value); setMessage(null); }} className="min-w-0 flex-1 bg-transparent text-[30px] font-semibold tabular-nums text-white outline-none" /><span className="text-[13px] font-medium text-[#cda4ff]">MIN</span></span><span className="mt-2 block text-[11px] text-white/38">Allowed range: 1–120 minutes</span></label>
                </div>
              </div>

              <aside className="rounded-[20px] border border-[#b887f1]/20 bg-[linear-gradient(155deg,rgba(155,104,213,0.14),rgba(255,255,255,0.025))] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cda4ff]">Current envelope</p><p className="mt-5 text-[36px] font-semibold leading-none text-white">{fileSizeMb || "—"}<span className="ml-1 text-[13px] text-white/48">MB</span></p><p className="mt-2 text-[14px] text-white/58">up to {durationMinutes || "—"} minutes</p>
                <div className="mt-5 flex flex-wrap gap-2">{FORMAT_OPTIONS.filter((option) => formats.has(option.key)).map((option) => <span key={option.key} className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[10px] font-semibold text-white/70">{option.label}</span>)}</div>
                <div className="mt-7 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/42"><p>Last updated</p><p className="text-white/68">{updatedLabel}</p><p className="mt-2">By {updatedBy}</p></div>
              </aside>
            </div>

            <div className="mt-6 flex gap-3 rounded-[16px] border border-[#e8bd55]/20 bg-[#2b250f]/55 p-4"><span className="mt-0.5 text-[#e8bd55]" aria-hidden="true">◆</span><div><p className="text-[13px] font-medium text-[#f4d57f]">Changes apply to future uploads only</p><p className="mt-1 text-[12px] leading-5 text-white/48">Existing audio testimonies and upload authorizations already issued keep the limits they were created with.</p></div></div>
            {validationError ? <p role="alert" className="mt-4 text-[13px] text-[#ef7066]">{validationError}</p> : null}
            {message ? <p className={`mt-4 text-[13px] ${messageTone === "success" ? "text-[#6BFFB4]" : "text-[#ef7066]"}`}>{message}</p> : null}
          </> : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-white/10 bg-black/15 px-6 py-5 sm:flex-row sm:justify-end sm:px-8"><button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-[11px] border border-white/15 px-5 text-[13px] text-white/68">Cancel</button><button type="button" disabled={phase !== "ready" || Boolean(validationError)} onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center justify-center rounded-[11px] bg-[#9B68D5] px-6 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(155,104,213,0.25)] disabled:cursor-not-allowed disabled:opacity-40">Review changes</button></footer>
      </section>

      {confirming ? <div className="absolute inset-0 z-20 grid place-items-center bg-black/65 px-4"><section className="w-full max-w-[440px] rounded-[22px] border border-white/10 bg-[#201927] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)]" aria-labelledby="confirm-policy-title"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#cda4ff]">Final check</p><h3 id="confirm-policy-title" className="mt-2 text-[22px] font-semibold text-white">Confirm policy update</h3><p className="mt-3 text-[13px] leading-6 text-white/58">New audio uploads will accept {Array.from(formats).map((value) => value.toUpperCase()).join(", ")}, up to {fileSizeMb} MB and {durationMinutes} minutes.</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setConfirming(false)} className="rounded-[10px] border border-white/15 px-4 py-3 text-[13px] text-white/65">Go back</button><button type="button" disabled={saving} onClick={savePolicy} className="rounded-[10px] bg-[#9B68D5] px-5 py-3 text-[13px] font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Confirm policy update"}</button></div></section></div> : null}
    </div>
  );
}
