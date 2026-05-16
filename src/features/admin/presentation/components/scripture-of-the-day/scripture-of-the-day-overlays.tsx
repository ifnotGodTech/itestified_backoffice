import Link from "next/link";
import type { ScriptureDraft, ScriptureOfTheDayViewModel, ScriptureRow, ScriptureStatus } from "@/features/admin/domain/entities/scripture-of-the-day";
import { buildScriptureOfTheDayHref } from "@/features/admin/presentation/state/scripture-of-the-day-route-state";

function StatusPill({ status }: { status: ScriptureStatus }) {
  const cls =
    status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] leading-none ${cls}`}>{status}</span>;
}

function DetailRow({ label, value, divider = true }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={divider ? "border-t border-white/10 px-6 py-6" : "px-6 py-6"}>
      <dt className="text-[15px] font-semibold text-white">{label}</dt>
      <dd className="mt-4 max-w-[690px] text-[15px] leading-7 text-white/82">{value}</dd>
    </div>
  );
}

function DetailModal({ viewModel, row }: { viewModel: ScriptureOfTheDayViewModel; row: ScriptureRow }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close scripture details modal" />
      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[22px] bg-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:max-h-[calc(100vh-4rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#171717] px-6 py-5">
          <h2 className="text-[26px] font-semibold text-white">Scripture Details</h2>
          <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <dl className="overflow-y-auto">
          <DetailRow label="Scripture" value={row.scripture} divider={false} />
          <DetailRow label="Prayer" value={row.prayer} />
          <DetailRow label="Bible Text" value={row.bibleText} />
          <DetailRow label="Bible Version" value={row.bibleVersion} />
          {row.status === "Scheduled" ? (
            <>
              <DetailRow label="Scheduled Date" value={row.scheduledDate ?? ""} />
              <DetailRow label="Scheduled Time" value={row.scheduledTime ?? ""} />
            </>
          ) : null}
          <div className="border-t border-white/10 px-6 py-6">
            <dt className="text-[15px] font-semibold text-white">Status</dt>
            <dd className="mt-4">
              <StatusPill status={row.status} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function EditModal({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  const draft: ScriptureDraft = viewModel.editDraft;
  const closeHref = buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery });
  const title = viewModel.isCreatingNew ? "Upload New Scripture" : "Edit Scripture";
  const ctaLabel = viewModel.isCreatingNew ? "Upload Scripture" : "Save Changes";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 sm:px-6 sm:py-8">
      <Link href={closeHref} className="absolute inset-0" aria-label="Close scripture edit modal" />
      <form action="/scripture-of-the-day" className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[22px] bg-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:max-h-[calc(100vh-4rem)]">
        <input type="hidden" name="tab" value={viewModel.activeTab} />
        <input type="hidden" name="q" value={viewModel.searchQuery} />
        <input type="hidden" name="saved" value="1" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#171717] px-6 py-5">
          <h2 className="text-[26px] font-semibold text-white">{title}</h2>
          <Link href={closeHref} className="text-[34px] leading-none text-white/90">
            ×
          </Link>
        </div>
        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <label className="block space-y-2">
            <span className="text-[15px] font-semibold text-white">Scripture</span>
            <textarea name="scripture" defaultValue={draft.scripture} rows={3} className="min-h-[88px] w-full resize-none rounded-[10px] bg-[#242424] px-4 py-3 text-[15px] leading-6 text-white outline-none" />
          </label>
          <label className="block space-y-2">
            <span className="text-[15px] font-semibold text-white">Prayer</span>
            <textarea name="prayer" defaultValue={draft.prayer} rows={2} className="min-h-[58px] w-full resize-none rounded-[10px] bg-[#242424] px-4 py-3 text-[15px] leading-6 text-white outline-none" />
          </label>
          <label className="block space-y-2">
            <span className="text-[15px] font-semibold text-white">Bible Text</span>
            <input name="bibleText" defaultValue={draft.bibleText} className="h-[40px] w-full rounded-[10px] bg-[#242424] px-4 text-[15px] text-white outline-none" />
          </label>
          <label className="block space-y-2">
            <span className="text-[15px] font-semibold text-white">Bible Version</span>
            <div className="relative">
              <select name="bibleVersion" defaultValue={draft.bibleVersion} className="h-[40px] w-full appearance-none rounded-[10px] bg-[#242424] px-4 pr-10 text-[15px] text-white outline-none">
                <option value="KJV">KJV</option>
                <option value="NIV">NIV</option>
                <option value="ESV">ESV</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/80">▾</span>
            </div>
          </label>
        </div>
        <div className="flex justify-end gap-4 border-t border-white/10 bg-[#171717] px-6 pb-6 pt-4">
          <Link href={closeHref} className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[18px] text-[#9B68D5]">
            Cancel
          </Link>
          <button type="submit" className="inline-flex min-w-[136px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-6 py-4 text-[18px] text-white">
            {ctaLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirmModal({ viewModel, row }: { viewModel: ScriptureOfTheDayViewModel; row: ScriptureRow }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <div className="relative w-full max-w-[560px] rounded-[22px] bg-[#1f1f1f] px-8 pb-8 pt-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute right-6 top-4 text-[34px] leading-none text-white/90">
          ×
        </Link>
        <h2 className="text-[24px] font-semibold text-white">Delete Scripture?</h2>
        <p className="mx-auto mt-6 max-w-[430px] text-[17px] leading-8 text-white/75">
          This will remove <span className="text-white">{row.bibleText}</span> from the scripture listing.
          <br />
          Are you sure you want to proceed?
        </p>
        <div className="mt-10 flex justify-center gap-6">
          <Link
            href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
            className="inline-flex min-w-[160px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-6 py-4 text-[18px] text-[#9B68D5]"
          >
            Cancel
          </Link>
          <Link
            href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, deleted: true })}
            className="inline-flex min-w-[160px] items-center justify-center rounded-[10px] bg-[#ef4335] px-6 py-4 text-[18px] text-white"
          >
            Yes, delete
          </Link>
        </div>
      </div>
    </div>
  );
}

function DeleteSuccessModal({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-10">
      <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close scripture deleted success modal" />
      <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-[#1f1f1f] px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-full bg-[#9B68D5] text-[78px] text-white">✓</div>
        <p className="mt-12 text-[30px] font-semibold leading-[1.3] text-white">Scripture Deleted Successfully!</p>
      </div>
    </div>
  );
}

function FilterModal({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })} className="absolute inset-0" aria-label="Close scripture filter modal" />
      <form action="/scripture-of-the-day" className="relative z-10 w-full max-w-[380px] overflow-hidden rounded-[20px] border border-white/10 bg-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <input type="hidden" name="tab" value={viewModel.activeTab} />
        <input type="hidden" name="q" value={viewModel.searchQuery} />
        <div className="border-b border-white/10 px-5 py-4 text-[14px] font-medium text-white">Filter</div>
        <div className="border-b border-white/10 px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] text-white">Date Range</span>
            <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, filter: true, statusFilter: viewModel.filterDraft.status })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-[13px] text-white/80">From</span>
              <div className="relative">
                <input name="from" defaultValue={viewModel.filterDraft.from} placeholder="dd/mm/yyyy" className="h-[40px] w-full rounded-[8px] bg-[#242424] px-10 pr-4 text-[14px] text-white/75 outline-none placeholder:text-white/30" />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">🗓</span>
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-[13px] text-white/80">To</span>
              <div className="relative">
                <input name="to" defaultValue={viewModel.filterDraft.to} placeholder="dd/mm/yyyy" className="h-[40px] w-full rounded-[8px] bg-[#242424] px-10 pr-4 text-[14px] text-white/75 outline-none placeholder:text-white/30" />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">🗓</span>
              </div>
            </label>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] text-white">Status</span>
            <Link href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, filter: true, from: viewModel.filterDraft.from, to: viewModel.filterDraft.to })} className="text-[14px] text-[#b27bff]">
              Clear
            </Link>
          </div>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2 text-[14px] text-white/85">
              <input type="radio" name="status" value="Uploaded" defaultChecked={viewModel.filterDraft.status === "Uploaded"} className="h-4 w-4 accent-[#9B68D5]" />
              <span>Uploaded</span>
            </label>
            <label className="inline-flex items-center gap-2 text-[14px] text-white/85">
              <input type="radio" name="status" value="Scheduled" defaultChecked={viewModel.filterDraft.status === "Scheduled"} className="h-4 w-4 accent-[#9B68D5]" />
              <span>Scheduled</span>
            </label>
          </div>
          <div className="mt-12 flex justify-end gap-4">
            <Link
              href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
              className="inline-flex min-w-[96px] items-center justify-center rounded-[10px] border border-[#9B68D5] px-4 py-3 text-[14px] text-[#c996ff]"
            >
              Clear All
            </Link>
            <button type="submit" className="inline-flex min-w-[96px] items-center justify-center rounded-[10px] bg-[#9B68D5] px-4 py-3 text-[14px] text-white">
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ScriptureOfTheDayOverlays({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <>
      {viewModel.showDetails && viewModel.selectedRow ? <DetailModal viewModel={viewModel} row={viewModel.selectedRow} /> : null}
      {viewModel.showEdit && !viewModel.showScheduleBuilder ? <EditModal viewModel={viewModel} /> : null}
      {viewModel.showDeleteConfirm && viewModel.selectedRow ? <DeleteConfirmModal viewModel={viewModel} row={viewModel.selectedRow} /> : null}
      {viewModel.deleteSuccess ? <DeleteSuccessModal viewModel={viewModel} /> : null}
      {viewModel.showFilterModal ? <FilterModal viewModel={viewModel} /> : null}
    </>
  );
}
