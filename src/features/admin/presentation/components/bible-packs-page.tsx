import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type {
  BiblePackChangeRow,
  BiblePackRow,
  BiblePacksViewModel,
} from "@/features/admin/domain/entities/bible-packs";

// Phase 34 Slice 8: which Bibles readers can download in the app. Server
// rendered; each action is a plain form post through the
// /api/admin/bible-packs proxy, and hiding a Bible asks first.

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

const CHANGE_WORDS: Record<BiblePackChangeRow["action"], (pack: string) => string> = {
  enabled: (pack) => `made ${pack} available`,
  disabled: (pack) => `hid ${pack}`,
  made_default: (pack) => `made ${pack} the default`,
};

function Pill({ tone, children }: { tone: "purple" | "green" | "grey"; children: ReactNode }) {
  const tones = {
    purple: "border-[#b887f1]/40 bg-[#9B68D5]/18 text-[#d8b8ff]",
    green: "border-[#0CBC32]/30 bg-[#0f2615] text-[#8de7a0]",
    grey: "border-white/12 bg-white/[0.04] text-white/60",
  };
  return (
    <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Banner({ viewModel }: { viewModel: BiblePacksViewModel }) {
  if (!viewModel.bannerMessage) return null;
  const success = viewModel.phaseState === "success";
  return (
    <div
      role="status"
      className={
        success
          ? "rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]"
          : "rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]"
      }
    >
      {viewModel.bannerMessage}
    </div>
  );
}

function ActionButton({
  code,
  action,
  label,
  primary = false,
}: {
  code: string;
  action: "enable" | "make-default";
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={`/api/admin/bible-packs/${code}/${action}`} method="POST">
      <button
        type="submit"
        className={
          primary
            ? "inline-flex h-9 items-center rounded-[9px] bg-[#9966CC] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#8844AA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c590ff]"
            : "inline-flex h-9 items-center rounded-[9px] border border-[#9B68D5] px-4 text-[12.5px] font-semibold text-[#c590ff] transition hover:bg-[#9B68D5]/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c590ff]"
        }
      >
        {label}
      </button>
    </form>
  );
}

function PackCard({ pack }: { pack: BiblePackRow }) {
  const isStudy = pack.kind === "study";
  const facts = [
    formatSize(pack.sizeBytes),
    `Data version ${pack.dataVersion}`,
    !isStudy && pack.supportsWordStudy ? "Word study" : null,
  ].filter(Boolean);
  return (
    <article
      aria-label={pack.name}
      className={`rounded-[16px] border px-5 py-5 ${
        pack.isEnabled ? "border-white/[0.07] bg-[var(--color-surface-elevated)]" : "border-dashed border-white/12 bg-transparent"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] text-[12px] font-extrabold tracking-[0.04em] ${
            pack.isDefault ? "bg-[#9B68D5]/20 text-[#d8b8ff]" : "bg-white/[0.06] text-white/85"
          }`}
        >
          {isStudy ? "Aα" : pack.abbreviation}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white">{pack.name}</h3>
            {pack.isDefault ? <Pill tone="purple">Default for new readers</Pill> : null}
            {pack.isEnabled ? <Pill tone="green">Available to readers</Pill> : <Pill tone="grey">Hidden</Pill>}
          </div>
          {pack.description ? <p className="mt-1 text-[12.5px] text-white/60">{pack.description}</p> : null}
          <p className="mt-1.5 text-[12px] text-white/45">{facts.join(" · ")}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {pack.canMakeDefault ? (
              <ActionButton code={pack.code} action="make-default" label="Make default" />
            ) : null}
            {pack.isEnabled ? (
              pack.hideBlockedReason === null ? (
                <Link
                  href={`/bible-packs?confirm=hide&code=${pack.code}`}
                  className="inline-flex h-9 items-center rounded-[9px] border border-white/15 px-4 text-[12.5px] font-semibold text-white/80 transition hover:border-[#E53935]/60 hover:text-[#ff9b98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c590ff]"
                >
                  Hide from readers
                </Link>
              ) : (
                <p className="text-[12px] leading-5 text-white/45">
                  <span className="font-semibold text-white/60">Can&rsquo;t be hidden: </span>
                  {pack.hideBlockedReason}
                </p>
              )
            ) : (
              <ActionButton code={pack.code} action="enable" label="Make available" primary />
            )}
          </div>

          {pack.attribution ? (
            <details className="group mt-4">
              <summary className="cursor-pointer select-none text-[12px] font-semibold text-[#c590ff] marker:content-none">
                Credits shown to readers <span className="inline-block transition group-open:rotate-90">›</span>
              </summary>
              <p className="mt-2 max-w-[640px] text-[12px] leading-5 text-white/55">{pack.attribution}</p>
            </details>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`} className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {title}
      </h2>
      <p className="mt-1 text-[12px] text-white/45">{description}</p>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function ConfirmHide({ pack }: { pack: BiblePackRow }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-hide-title"
        className="w-full max-w-[440px] rounded-[18px] border border-white/10 bg-[var(--color-surface-elevated)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      >
        <h2 id="confirm-hide-title" className="text-[17px] font-semibold text-white">
          Hide {pack.name}?
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-white/65">
          <li>New readers won&rsquo;t see it in the list of Bibles to download.</li>
          <li>Readers who already downloaded it keep it and can still read it offline.</li>
          {pack.kind === "study" ? <li>Readers without it won&rsquo;t be able to look words up.</li> : null}
          <li>You can make it available again at any time.</li>
        </ul>
        <div className="mt-6 flex justify-end gap-2.5">
          <Link
            href="/bible-packs"
            className="inline-flex h-10 items-center rounded-[10px] border border-white/15 px-4 text-[13px] font-semibold text-white/80"
          >
            Cancel
          </Link>
          <form action={`/api/admin/bible-packs/${pack.code}/disable`} method="POST">
            <button
              type="submit"
              autoFocus
              className="inline-flex h-10 items-center rounded-[10px] bg-[#E53935] px-4 text-[13px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Hide {pack.abbreviation}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function BiblePacksPage({ viewModel }: { viewModel: BiblePacksViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[860px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <h1 className="text-[18px] font-semibold text-white">Bible downloads</h1>
          <p className="mt-2 max-w-[640px] text-[12px] leading-5 text-white/55">
            Choose which Bibles readers can download in the app, and which one new readers get first. New files and
            corrections are published at release time; they reach readers as an update.
          </p>
        </div>

        <div className="flex flex-col gap-7 bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.phaseState === "error" && viewModel.versions.length === 0 ? (
            <div className="rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load the Bible settings" message={viewModel.errorMessage} />
            </div>
          ) : (
            <>
              <Banner viewModel={viewModel} />

              <Section
                title="Bibles"
                description="Readers choose among these in the Bible tab. The default is offered on first open."
              >
                {viewModel.versions.map((pack) => (
                  <PackCard key={pack.code} pack={pack} />
                ))}
              </Section>

              {viewModel.studyPacks.length > 0 ? (
                <Section
                  title="Word study"
                  description="Greek and Hebrew meanings and every use of a word, shared by every Bible that supports word study."
                >
                  {viewModel.studyPacks.map((pack) => (
                    <PackCard key={pack.code} pack={pack} />
                  ))}
                </Section>
              ) : null}

              <section aria-labelledby="recent-changes">
                <h2 id="recent-changes" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  Recent changes
                </h2>
                {viewModel.changes.length === 0 ? (
                  <p className="mt-2 text-[12.5px] text-white/45">No changes yet.</p>
                ) : (
                  <ol className="mt-3 divide-y divide-white/[0.06] rounded-[14px] bg-[var(--color-surface-elevated)]">
                    {viewModel.changes.map((change, index) => (
                      <li key={`${change.createdAt}-${index}`} className="flex flex-wrap justify-between gap-2 px-4 py-3">
                        <span className="text-[13px] text-white/80">
                          <span className="font-semibold text-white">{change.actorName}</span>{" "}
                          {CHANGE_WORDS[change.action](change.packName)}
                        </span>
                        <time dateTime={change.createdAt} className="text-[12px] text-white/40">
                          {formatWhen(change.createdAt)}
                        </time>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      {viewModel.confirmHide ? <ConfirmHide pack={viewModel.confirmHide} /> : null}
    </AdminDashboardShell>
  );
}
