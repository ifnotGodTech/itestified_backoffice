import Link from "next/link";
import type { ScriptureOfTheDayViewModel } from "@/features/admin/domain/entities/scripture-of-the-day";
import { buildScriptureOfTheDayHref } from "@/features/admin/presentation/state/scripture-of-the-day-route-state";

export function ScriptureScheduleBuilder({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <form action="/scripture-of-the-day" className="max-w-[980px] space-y-4">
      <input type="hidden" name="tab" value="scheduled" />
      <input type="hidden" name="saved" value="1" />
      <div className="flex items-center justify-end">
        <button type="submit" className="rounded-[8px] bg-white/40 px-6 py-2 text-[14px] text-white/80">
          Save
        </button>
      </div>

      <div className="rounded-[26px] bg-[#171717] px-4 py-5">
        <div className="mb-4 flex justify-end">
          <span className="rounded-full bg-white/8 px-4 py-2 text-[12px] text-white/60">
            {viewModel.scheduleEntryCount - 1} Added • Maximum 20 scriptures at a time
          </span>
        </div>

        <div className="rounded-[18px] border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <h3 className="text-[18px] font-medium text-white">Scripture 1</h3>
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-white/10 text-[24px] leading-none text-white/85">
                ×
              </button>
              <button type="button" className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-white/10 text-[12px] text-white/85">
                ▾
              </button>
            </div>
          </div>
          <div className="grid gap-5 px-4 py-5">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-white/90">Bible Verse</span>
                <div className="relative">
                  <select className="h-[44px] w-full appearance-none rounded-[8px] bg-[#242424] px-4 pr-10 text-[13px] text-white/50 outline-none">
                    <option>Select Bible Verse</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">▾</span>
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-white/90">Bible Version</span>
                <div className="relative">
                  <select className="h-[44px] w-full appearance-none rounded-[8px] bg-[#242424] px-4 pr-10 text-[13px] text-white/50 outline-none">
                    <option>Select Version</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">▾</span>
                </div>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-[13px] font-medium text-white/90">Prayer</span>
              <textarea
                rows={2}
                placeholder="Type Prayer here..."
                className="min-h-[86px] w-full resize-none rounded-[8px] bg-[#242424] px-4 py-3 text-[13px] text-white/75 outline-none placeholder:text-white/30"
              />
            </label>
          </div>
        </div>

        <div className="mt-7">
          <Link
            href={buildScriptureOfTheDayHref({ edit: "new", count: viewModel.scheduleEntryCount + 1 })}
            className="inline-flex h-[30px] items-center justify-center rounded-[8px] border border-[#9B68D5] px-4 text-[14px] text-[#c996ff]"
          >
            + Add New
          </Link>
        </div>
      </div>

      <div className="rounded-[26px] bg-[#171717] px-4 py-5">
        <h3 className="text-[18px] font-medium text-white">Schedule Settings</h3>
        <div className="mt-7 grid grid-cols-[1fr_1fr_1fr] gap-4">
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-white/90">From</span>
            <div className="relative">
              <input name="from" placeholder="MM/DD/YYYY" className="h-[44px] w-full rounded-[8px] bg-[#242424] px-4 pr-10 text-[13px] text-white/50 outline-none placeholder:text-white/30" />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">🗓</span>
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-white/90">To</span>
            <div className="relative">
              <input name="to" placeholder="MM/DD/YYYY" className="h-[44px] w-full rounded-[8px] bg-[#242424] px-4 pr-10 text-[13px] text-white/50 outline-none placeholder:text-white/30" />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">🗓</span>
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-[13px] font-medium text-white/90">Time</span>
            <div className="relative">
              <input name="time" defaultValue="00:00" className="h-[44px] w-full rounded-[8px] bg-[#242424] px-4 pr-10 text-[13px] text-white/50 outline-none" />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/55">◔</span>
            </div>
            <p className="text-[11px] text-white/35">Scriptures will be posted Daily at this time</p>
          </label>
        </div>
      </div>
    </form>
  );
}
