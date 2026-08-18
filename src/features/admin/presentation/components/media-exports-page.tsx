"use client";

import Link from "next/link";
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
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function MediaExportsPage({ viewModel }: { viewModel: MediaExportViewModel }) {
  const { branding } = viewModel;
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
              <label className="block md:col-span-2">
                <span className="text-[12px] font-semibold text-white/75">Logo asset URL</span>
                <input name="logo_url" defaultValue={branding.logoUrl} placeholder="https://res.cloudinary.com/.../logo.png" className="mt-2 h-11 w-full rounded-[10px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none transition focus:border-[#b98aff]" />
                <span className="mt-1.5 block text-[11px] text-white/35">Placed in the top-left corner of exported videos.</span>
              </label>
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
                {branding.logoUrl ? (
                  // Admin-provided asset URLs cannot be known at build time for next/image's remotePatterns.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={branding.logoUrl} alt="Brand logo preview" className="absolute left-3 top-3 max-h-9 max-w-[85px] object-contain" />
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
