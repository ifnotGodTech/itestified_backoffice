"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { MediaExportStatus, MediaExportViewModel } from "@/features/admin/domain/entities/media-exports";
import { AdminDashboardShell } from "./admin-dashboard-shell";
import { AdminErrorState } from "./shared/admin-table-primitives";

const statusStyles: Record<MediaExportStatus, string> = {
  pending: "border-[#ffbf7a]/30 bg-[#2a1a0d] text-[#ffbf7a]",
  processing: "border-[#9f83ff]/30 bg-[#211a39] text-[#cbbcff]",
  done: "border-[#0cbc32]/30 bg-[#0f2615] text-[#8de7a0]",
  failed: "border-[#ff6b6b]/30 bg-[#321313] text-[#ff9b9b]",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  // A fixed locale, not undefined -- undefined defers to the runtime's own
  // default, which is the server process's locale during SSR and the
  // browser's during hydration. Those can differ (day/month order, 12h vs
  // 24h clock), which is exactly what a hydration mismatch flags.
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function extractApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong. Please try again.";
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (typeof first === "string") return first;
    }
  }
  return "Something went wrong. Please try again.";
}

type LogoUploadSignature = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  public_id: string;
  overwrite: boolean;
  signature: string;
};

async function requestLogoUploadSignature(): Promise<LogoUploadSignature> {
  const response = await fetch("/api/admin/media-exports/logo-upload-signature", { method: "POST" });
  const data = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) throw new Error(extractApiErrorMessage(data));
  return data as LogoUploadSignature;
}

async function uploadLogoToCloudinary(file: File): Promise<string> {
  const signature = await requestLogoUploadSignature();
  const uploadFormData = new FormData();
  uploadFormData.set("file", file);
  uploadFormData.set("api_key", signature.api_key);
  uploadFormData.set("timestamp", String(signature.timestamp));
  uploadFormData.set("public_id", signature.public_id);
  uploadFormData.set("overwrite", "true");
  uploadFormData.set("signature", signature.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`, {
    method: "POST",
    body: uploadFormData,
  });
  const data = (await response.json().catch(() => null)) as { secure_url?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(data?.error?.message || `Cloudinary upload failed (${response.status}).`);
  }
  if (!data?.secure_url) throw new Error("Cloudinary did not return an uploaded file URL.");
  return data.secure_url;
}

export function MediaExportsPage({ viewModel }: { viewModel: MediaExportViewModel }) {
  const { branding } = viewModel;
  const [logoMode, setLogoMode] = useState<"default" | "custom">(branding.logoUrl ? "custom" : "default");
  const [customLogoUrl, setCustomLogoUrl] = useState(branding.logoUrl);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    setLogoUploadError(null);
    try {
      const uploadedUrl = await uploadLogoToCloudinary(file);
      setCustomLogoUrl(uploadedUrl);
      setLogoMode("custom");
    } catch (error) {
      setLogoUploadError(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  }

  const activeLogoPreviewUrl = logoMode === "custom" ? customLogoUrl : branding.defaultLogoUrl;

  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[1180px] space-y-5 pt-2">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ba8cff]">Export studio</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-white">Shareable testimony branding</h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-6 text-white/55">
              Set the identity that travels with every video saved to a gallery or shared to social media. Changes create a new branding version for future exports.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/65">
            Version <span className="font-semibold text-white">v{branding.version}</span>
          </div>
        </div>

        {viewModel.state === "error" ? (
          <div className="rounded-[16px] border border-white/8 bg-[var(--color-surface-elevated)]"><AdminErrorState title="Export studio unavailable" message={viewModel.errorMessage} /></div>
        ) : null}
        {viewModel.state === "success" ? <div className="rounded-[12px] border border-[#0cbc32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">{viewModel.successMessage}</div> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            action="/api/admin/media-exports/branding"
            method="POST"
            className="rounded-[18px] border border-white/8 bg-[var(--color-surface-elevated)] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.18)] md:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Brand kit</h2>
                <p className="mt-1 text-[12px] text-white/45">Cloudinary-hosted assets work best here.</p>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-white/65">
                <input type="checkbox" name="is_enabled" defaultChecked={branding.isEnabled} className="h-4 w-4 accent-[#9B68D5]" />
                Exports enabled
              </label>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="block md:col-span-2">
                <span className="text-[12px] font-semibold text-white/75">Logo</span>
                <input type="hidden" name="logo_url" value={logoMode === "custom" ? customLogoUrl : ""} />
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setLogoMode("default")}
                    className={`rounded-[10px] border p-3 text-left transition ${logoMode === "default" ? "border-[#b98aff] bg-[#241733]" : "border-white/10 bg-[var(--color-surface-muted)] hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-3">
                      {branding.defaultLogoUrl ? (
                        // Cloudinary's own delivery URL for our fixed default-logo public_id.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={branding.defaultLogoUrl} alt="Default iTestified logo" className="h-10 w-10 rounded-full bg-black/20 object-contain" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-white/10" />
                      )}
                      <div>
                        <p className="text-[12px] font-semibold text-white">Our default</p>
                        <p className="text-[11px] text-white/45">The iTestified mark, always available.</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoMode("custom");
                      logoFileInputRef.current?.click();
                    }}
                    className={`rounded-[10px] border p-3 text-left transition ${logoMode === "custom" ? "border-[#b98aff] bg-[#241733]" : "border-white/10 bg-[var(--color-surface-muted)] hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-3">
                      {customLogoUrl ? (
                        // Admin-provided asset URLs cannot be known at build time for next/image's remotePatterns.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={customLogoUrl} alt="Custom logo" className="h-10 w-10 rounded-full bg-black/20 object-contain" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[16px] text-white/50">+</div>
                      )}
                      <div>
                        <p className="text-[12px] font-semibold text-white">{customLogoUrl ? "Custom logo" : "Upload a logo"}</p>
                        <p className="text-[11px] text-white/45">{isUploadingLogo ? "Uploading…" : "Replaces the previous upload -- never adds a new one."}</p>
                      </div>
                    </div>
                  </button>
                </div>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                {logoUploadError ? <p className="mt-1.5 text-[11px] text-[#ff9b9b]">{logoUploadError}</p> : null}
                <span className="mt-1.5 block text-[11px] text-white/35">Placed in the top-left corner of exported videos.</span>
              </div>
              <label className="block">
                <span className="text-[12px] font-semibold text-white/75">Watermark text</span>
                <input name="watermark_text" required maxLength={120} defaultValue={branding.watermarkText} className="mt-2 h-11 w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none transition focus:border-[#b98aff]" />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-white/75">End-card image URL</span>
                <input name="end_card_url" defaultValue={branding.endCardUrl} placeholder="https://res.cloudinary.com/.../end-card.png" className="mt-2 h-11 w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none transition focus:border-[#b98aff]" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-[12px] font-semibold text-white/75">Call to action</span>
                <textarea name="call_to_action" required maxLength={255} defaultValue={branding.callToAction} rows={3} className="mt-2 w-full resize-none rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-3 py-3 text-[13px] leading-5 text-white outline-none transition focus:border-[#b98aff]" />
                <span className="mt-1.5 block text-[11px] text-white/35">Shown with the watermark so every shared video points back to iTestified.</span>
              </label>
            </div>

            <div className="mt-6 rounded-[12px] border border-[#ffbf7a]/20 bg-[#2a1a0d]/60 px-4 py-3 text-[12px] leading-5 text-[#ffc990]">
              Updating this kit affects future exports only. Existing exported files and original testimony videos remain unchanged.
            </div>
            <label className="mt-5 flex items-start gap-3 text-[12px] leading-5 text-white/60">
              <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#9B68D5]" />
              I understand this change affects videos shared outside the app.
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <Link href="/overview" className="inline-flex h-10 items-center rounded-[9px] border border-white/15 px-4 text-[12px] text-white/65">Cancel</Link>
              <button type="submit" className="inline-flex h-10 items-center rounded-[9px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white transition hover:bg-[#aa78e2]">Save branding</button>
            </div>
          </form>

          <div className="rounded-[18px] border border-white/8 bg-[var(--color-surface-elevated)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-white">Share preview</h2>
                <p className="mt-1 text-[12px] text-white/45">A visual check before publishing a new version.</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#0cbc32] shadow-[0_0_14px_#0cbc32]" />
            </div>
            <div className="mx-auto mt-6 max-w-[220px] rounded-[26px] border-[6px] border-[#35303d] bg-[#110d17] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
              <div className="relative flex aspect-[9/16] flex-col justify-end overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_50%_30%,#6b3c86,#241733_46%,#0e0b13)] p-4">
                {activeLogoPreviewUrl ? (
                  // Admin-provided asset URLs cannot be known at build time for next/image's remotePatterns.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeLogoPreviewUrl} alt="Brand logo preview" className="absolute left-3 top-3 max-h-9 max-w-[85px] object-contain" />
                ) : <div className="absolute left-3 top-3 rounded bg-white/10 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-white">iTESTIFIED</div>}
                <div className="absolute inset-x-0 top-[44%] h-px bg-white/20" />
                <div className="relative border-t border-white/30 pt-3 text-center text-[9px] leading-4 text-white/90">
                  <p className="font-semibold">{branding.watermarkText || "From iTestified"}</p>
                  <p className="mt-1 text-white/65">{branding.callToAction || "Get the iTestified app for more inspiring testimonies."}</p>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-[11px] leading-5 text-white/35">Preview represents the attribution layer. The original testimony media is never replaced.</p>
          </div>
        </div>

        <section className="rounded-[18px] border border-white/8 bg-[var(--color-surface-elevated)] p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div><h2 className="text-[17px] font-semibold text-white">Generation ledger</h2><p className="mt-1 text-[12px] text-white/45">Recent branded derivatives, including failures that need attention.</p></div>
            <span className="text-[12px] text-white/40">{viewModel.total} total exports</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            {viewModel.rows.length === 0 ? <div className="rounded-[12px] border border-dashed border-white/10 px-4 py-10 text-center text-[13px] text-white/40">No branded export jobs yet. They will appear here when users share or save videos.</div> : (
              <table className="w-full min-w-[720px] text-left text-[12px]"><thead className="border-b border-white/8 text-[10px] uppercase tracking-[0.12em] text-white/35"><tr><th className="pb-3 font-medium">Testimony</th><th className="pb-3 font-medium">Brand</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Retries</th><th className="pb-3 font-medium">Updated</th></tr></thead><tbody className="divide-y divide-white/6">{viewModel.rows.map((row) => <tr key={row.id}><td className="py-4 pr-5"><p className="font-medium text-white/85">{row.testimonyTitle}</p><p className="mt-1 text-[11px] text-white/35">Testimony #{row.testimonyId}</p>{row.errorMessage ? <p className="mt-1 max-w-[360px] text-[11px] text-[#ff9b9b]">{row.errorMessage}</p> : null}</td><td className="py-4 text-white/55">v{row.brandingVersion}</td><td className="py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyles[row.status]}`}>{row.status}</span></td><td className="py-4 text-white/55">{row.retryCount}</td><td className="py-4 text-white/45">{formatDate(row.updatedAt)}</td></tr>)}</tbody></table>
            )}
          </div>
        </section>
      </div>
    </AdminDashboardShell>
  );
}
