"use client";

export function HomeManagementApplyConfirmModal({
  removedTitles,
  keptCount,
  busy,
  onConfirm,
  onCancel,
}: {
  removedTitles: string[];
  keptCount: number;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <button type="button" onClick={onCancel} className="absolute inset-0" aria-label="Close apply confirmation" />
      <div className="relative w-full max-w-[560px] rounded-[22px] bg-[var(--color-surface-elevated)] px-8 pb-8 pt-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-6 top-6 text-[34px] leading-none text-white/90"
          aria-label="Close apply confirmation"
        >
          ×
        </button>
        <h2 className="text-[24px] font-semibold text-white">Remove {removedTitles.length} from Featured?</h2>
        <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-7 text-white/75">
          This will keep only the top {keptCount} and remove the rest from the homepage lineup. They will still be
          available to add back later, but this can&apos;t be undone in one click.
        </p>
        <ul className="mx-auto mt-4 max-h-[180px] max-w-[440px] space-y-1 overflow-y-auto rounded-[10px] bg-[var(--color-surface-muted)] px-4 py-3 text-left text-[13px] text-white/80">
          {removedTitles.map((title, index) => (
            <li key={`${title}-${index}`}>• {title}</li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-w-[160px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[18px] text-[#9B68D5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex min-w-[160px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[18px] text-white disabled:opacity-60"
          >
            {busy ? "Applying..." : "Yes, apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
