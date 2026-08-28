import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";
import type {
  MediaUploadPolicySection,
  MediaUploadPolicyViewModel,
  UploadPolicyForm,
} from "@/features/admin/domain/entities/media-upload-policy";

type FormatOption = { value: string; label: string; group: string[] };

const VIDEO_FORMAT_OPTIONS: FormatOption[] = [
  { value: "mp4", label: "MP4", group: ["video/mp4"] },
  { value: "mov", label: "MOV", group: ["video/quicktime"] },
];

const AUDIO_FORMAT_OPTIONS: FormatOption[] = [
  { value: "aac", label: "AAC", group: ["audio/aac"] },
  { value: "m4a", label: "M4A", group: ["audio/mp4", "audio/x-m4a"] },
  { value: "mp3", label: "MP3", group: ["audio/mpeg", "audio/mp3"] },
];

function isFormatSelected(option: FormatOption, allowedContentTypes: string[]): boolean {
  return option.group.some((contentType) => allowedContentTypes.includes(contentType));
}

function Banner({ viewModel }: { viewModel: MediaUploadPolicyViewModel }) {
  if (viewModel.phaseState === "success") {
    return (
      <div className="mb-4 rounded-[12px] border border-[#0CBC32]/25 bg-[#0f2615] px-4 py-3 text-[13px] text-[#8de7a0]">
        {viewModel.successMessage}
      </div>
    );
  }
  if (viewModel.phaseState === "validation") {
    return (
      <div className="mb-4 rounded-[12px] border border-[#FF8D28]/25 bg-[#2a1a0d] px-4 py-3 text-[13px] text-[#ffbf7a]">
        {viewModel.validationMessage}
      </div>
    );
  }
  return null;
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] bg-[var(--color-surface-elevated)] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      {description ? <p className="mt-1 text-[12px] text-white/55">{description}</p> : null}
      {children}
    </div>
  );
}

function PolicyForm({
  section,
  title,
  description,
  policy,
  formatOptions,
  formatFieldName,
  sizeRangeLabel,
  sizeMin,
  sizeMax,
  durationRangeLabel,
  durationMin,
  durationMax,
  durationStep,
}: {
  section: MediaUploadPolicySection;
  title: string;
  description: string;
  policy: UploadPolicyForm;
  formatOptions: FormatOption[];
  formatFieldName: string;
  sizeRangeLabel: string;
  sizeMin: number;
  sizeMax: number;
  durationRangeLabel: string;
  durationMin: number;
  durationMax: number;
  durationStep: string;
}) {
  const roundedSize = Math.round(policy.maxFileSizeMb * 100) / 100;
  const roundedDuration = Math.round(policy.maxDurationMinutes * 100) / 100;

  return (
    <form action={`/api/admin/testimonies/${section}-upload-policy`} method="POST">
      <Section title={title} description={description}>
        <div className="mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Accepted formats</span>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {formatOptions.map((option) => (
              <label
                key={option.value}
                className="relative cursor-pointer rounded-[14px] border border-white/10 bg-white/[0.025] px-3 py-3 text-center transition has-[:checked]:border-[#b887f1]/55 has-[:checked]:bg-[#9B68D5]/14"
              >
                <input
                  type="checkbox"
                  name={formatFieldName}
                  value={option.value}
                  defaultChecked={isFormatSelected(option, policy.allowedContentTypes)}
                  className="peer sr-only"
                />
                <span className="text-[13px] font-semibold text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[11px] text-white/60">Max file size (MB)</span>
            <input
              type="number"
              name="max_file_size_mb"
              min={sizeMin}
              max={sizeMax}
              step="any"
              defaultValue={roundedSize}
              className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
            />
            <span className="mt-1 block text-[10px] text-white/38">{sizeRangeLabel}</span>
          </label>
          <label className="block">
            <span className="text-[11px] text-white/60">Max duration (minutes)</span>
            <input
              type="number"
              name="max_duration_minutes"
              min={durationMin}
              max={durationMax}
              step={durationStep}
              defaultValue={roundedDuration}
              className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
            />
            <span className="mt-1 block text-[10px] text-white/38">{durationRangeLabel}</span>
          </label>
          <label className="block">
            <span className="text-[11px] text-white/60">Daily submission limit</span>
            <input
              type="number"
              name="daily_limit"
              min={1}
              max={50}
              step={1}
              defaultValue={policy.dailyLimit}
              className="mt-1 h-10 w-full rounded-[8px] border border-white/10 bg-[var(--color-surface-muted)] px-3 text-[13px] text-white outline-none focus:border-[#9B68D5]"
            />
            <span className="mt-1 block text-[10px] text-white/38">Per user, resets at midnight</span>
          </label>
        </div>

        {policy.updatedAt ? (
          <p className="mt-3 text-[11px] text-white/40">
            Last changed {new Date(policy.updatedAt).toLocaleString()}
            {policy.updatedByName ? ` by ${policy.updatedByName}` : ""}
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-white/40">Not changed yet -- currently using system defaults.</p>
        )}

        <div className="mt-5 flex justify-end">
          <button type="submit" className="inline-flex h-10 items-center rounded-[8px] bg-[#9B68D5] px-5 text-[12px] font-semibold text-white">
            Save {title}
          </button>
        </div>
      </Section>
    </form>
  );
}

export function MediaUploadPolicyPage({ viewModel }: { viewModel: MediaUploadPolicyViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[860px] pt-4">
        <div className="border-b border-white/10 bg-[var(--color-surface-strong)] px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[18px] font-semibold text-white">{viewModel.pageTitle}</h1>
              <p className="mt-2 text-[12px] text-white/55">{viewModel.pageDescription}</p>
            </div>
            <Link
              href="/testimonies"
              className="inline-flex h-9 shrink-0 items-center rounded-[8px] border border-[#9B68D5] px-4 text-[12px] font-semibold text-[#c590ff]"
            >
              Back to panel
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 bg-[var(--color-surface-strong)] px-4 py-6">
          {viewModel.phaseState === "error" ? (
            <div className="rounded-[14px] bg-[var(--color-surface-elevated)]">
              <AdminErrorState title="Unable to load this page" message={viewModel.errorMessage} />
            </div>
          ) : (
            <>
              <Banner viewModel={viewModel} />

              <div className="flex gap-3 rounded-[16px] border border-[#e8bd55]/20 bg-[#2b250f]/55 p-4">
                <span className="mt-0.5 text-[#e8bd55]" aria-hidden="true">
                  ◆
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#f4d57f]">Changes apply to future uploads only</p>
                  <p className="mt-1 text-[12px] leading-5 text-white/48">
                    Existing testimonies and upload authorizations already issued keep the limits they were created with.
                    A real upload is still checked against Cloudinary&rsquo;s own reported size/duration/format after it
                    lands, regardless of what a client claims -- these caps are enforced there too, not just here.
                  </p>
                </div>
              </div>

              <PolicyForm
                section="video"
                title="Video upload policy"
                description="Governs a Premium user's self-service video testimony (record in-app or import)."
                policy={viewModel.video}
                formatOptions={VIDEO_FORMAT_OPTIONS}
                formatFieldName="video_formats"
                sizeRangeLabel="Allowed range: 10 MB - 2 GB"
                sizeMin={10}
                sizeMax={2048}
                durationRangeLabel="Allowed range: 0.5 - 60 minutes"
                durationMin={0.5}
                durationMax={60}
                durationStep="0.5"
              />

              <PolicyForm
                section="audio"
                title="Audio upload policy"
                description="Governs a Premium user's self-service audio testimony (record in-app or import)."
                policy={viewModel.audio}
                formatOptions={AUDIO_FORMAT_OPTIONS}
                formatFieldName="audio_formats"
                sizeRangeLabel="Allowed range: 1 - 500 MB"
                sizeMin={1}
                sizeMax={500}
                durationRangeLabel="Allowed range: 1 - 120 minutes"
                durationMin={1}
                durationMax={120}
                durationStep="1"
              />
            </>
          )}
        </div>
      </div>
    </AdminDashboardShell>
  );
}
