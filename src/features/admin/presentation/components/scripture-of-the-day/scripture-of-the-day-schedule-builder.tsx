import type { ScriptureOfTheDayViewModel } from "@/features/admin/domain/entities/scripture-of-the-day";

export function ScriptureScheduleBuilder({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  const draft = viewModel.editDraft;
  return (
    <form action="/api/admin/content/scriptures" method="POST" className="max-w-[980px] space-y-4">
      <div className="flex items-center justify-end">
        <button type="submit" className="rounded-[8px] bg-white/40 px-6 py-2 text-[14px] text-white/80">
          Save
        </button>
      </div>

      {viewModel.formError ? (
        <p className="text-[13px] text-[#ef4335]">{viewModel.formError}</p>
      ) : null}

      <div className="rounded-[26px] bg-[var(--color-surface-elevated)] px-4 py-5">
        <div className="rounded-[18px] border border-white/15">
          <div className="border-b border-white/10 px-4 py-4">
            <h3 className="text-[18px] font-medium text-white">Scripture Details</h3>
          </div>
          <div className="grid gap-5 px-4 py-5">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-white/90">Bible Verse</span>
                <input
                  name="bible_text"
                  placeholder="Jeremiah 29:11"
                  defaultValue={draft.bibleText}
                  required
                  className="h-[44px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[13px] text-white/85 outline-none placeholder:text-white/50"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-white/90">Bible Version</span>
                <div className="relative">
                  <select name="bible_version" defaultValue={draft.bibleVersion} className="h-[44px] w-full appearance-none rounded-[8px] bg-[var(--color-surface-muted)] px-4 pr-10 text-[13px] text-white/85 outline-none">
                    <option value="KJV">KJV</option>
                    <option value="NIV">NIV</option>
                    <option value="ESV">ESV</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">▾</span>
                </div>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-white/90">Scripture</span>
              <textarea
                name="scripture"
                rows={2}
                placeholder="Type scripture here..."
                defaultValue={draft.scripture}
                required
                className="min-h-[86px] w-full resize-none rounded-[8px] bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white/75 outline-none placeholder:text-white/30"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-white/90">Prayer</span>
              <textarea
                name="prayer"
                rows={2}
                placeholder="Type Prayer here..."
                defaultValue={draft.prayer}
                className="min-h-[86px] w-full resize-none rounded-[8px] bg-[var(--color-surface-muted)] px-4 py-3 text-[13px] text-white/75 outline-none placeholder:text-white/30"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] bg-[var(--color-surface-elevated)] px-4 py-5">
        <h3 className="text-[18px] font-medium text-white">Schedule Settings</h3>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:max-w-[280px]">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-white/90">Date</span>
            <input
              type="date"
              name="date"
              defaultValue={draft.date}
              required
              className="h-[44px] w-full rounded-[8px] bg-[var(--color-surface-muted)] px-4 text-[13px] text-white/85 outline-none [color-scheme:dark]"
            />
            <p className="text-[11px] text-white/35">No two scriptures can share the same date.</p>
          </label>
        </div>
      </div>
    </form>
  );
}
