import Link from "next/link";
import type { ScriptureOfTheDayViewModel, ScriptureRow, ScriptureStatus } from "@/features/admin/domain/entities/scripture-of-the-day";
import { buildScriptureOfTheDayHref } from "@/features/admin/presentation/state/scripture-of-the-day-route-state";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="4.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.7 12.7 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h13l-5 5.5v4.2l-3 1.3V11L3.5 5.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function RowMenuIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="15.5" r="1.5" />
    </svg>
  );
}

function StatusPill({ status }: { status: ScriptureStatus }) {
  const cls =
    status === "Uploaded"
      ? "border-[#0cbc32]/25 bg-[#0d3215] text-[#0cbc32]"
      : "border-[#f0c400]/25 bg-[#2f2906] text-[#f0c400]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] leading-none ${cls}`}>{status}</span>;
}

function ActionTabs({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex gap-4 text-[13px]">
        {viewModel.tabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildScriptureOfTheDayHref({ tab: tab.key, q: viewModel.searchQuery })}
            className={`border-b pb-1 ${tab.key === viewModel.activeTab ? "border-[#9B68D5] text-white" : "border-transparent text-white/45"}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SearchAndFilter({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <form action="/scripture-of-the-day" className="mb-4 flex items-center justify-between gap-3">
      <input type="hidden" name="tab" value={viewModel.activeTab} />
      <div className="relative ml-auto w-full max-w-[290px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          <SearchIcon />
        </span>
        <input
          name="q"
          defaultValue={viewModel.searchQuery}
          placeholder="Search by bible version, scripture, prayer..."
          className="h-[38px] w-full rounded-[8px] bg-[#242424] pl-9 pr-4 text-[12px] text-white/75 outline-none placeholder:text-white/30"
        />
      </div>
      <Link
        href={buildScriptureOfTheDayHref({
          tab: viewModel.activeTab,
          q: viewModel.searchQuery,
          filter: true,
          from: viewModel.filterDraft.from,
          to: viewModel.filterDraft.to,
          statusFilter: viewModel.filterDraft.status,
        })}
        className="inline-flex h-[38px] min-w-[80px] items-center justify-center gap-2 rounded-[8px] border border-[#9B68D5] px-4 text-[14px] text-[#d8b8ff]"
      >
        <FilterIcon />
        <span>Filter</span>
      </Link>
    </form>
  );
}

export function ScriptureOfTheDayOverviewTable({ viewModel }: { viewModel: ScriptureOfTheDayViewModel }) {
  return (
    <div className="relative rounded-[18px] bg-[#171717]">
      <div className="overflow-hidden rounded-[18px]">
        <div className="px-4 pb-2 pt-4 text-[18px] font-medium text-white">Scripture of the day</div>
        <div className="px-4 pb-4">
          <ActionTabs viewModel={viewModel} />
          <SearchAndFilter viewModel={viewModel} />
        </div>
        <div className="border-t border-white/5">
          <div className="grid grid-cols-[64px_116px_116px_1.2fr_100px_1.05fr_110px_54px] bg-[#2a2a2a] px-3 py-[9px] text-[10px] font-medium text-white/70">
            <span>S/N</span>
            <span>Date</span>
            <span>Bible Text</span>
            <span>Scripture</span>
            <span>Bible Version</span>
            <span>Prayer</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {viewModel.rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[64px_116px_116px_1.2fr_100px_1.05fr_110px_54px] items-center border-t border-white/10 px-3 py-[9px] text-[12px] text-white/85"
            >
              <span>{row.id}</span>
              <span>{row.date}</span>
              <span>{row.bibleText}</span>
              <span>{row.scripture}</span>
              <span>{row.bibleVersion}</span>
              <span>{row.prayer}</span>
              <span>
                <StatusPill status={row.status} />
              </span>
              <div className="relative flex justify-end text-white/82">
                <Link
                  href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, menu: row.id })}
                  aria-label={`Open actions for scripture ${row.id}`}
                >
                  <RowMenuIcon />
                </Link>
                {viewModel.showActionMenu && viewModel.selectedRow?.id === row.id ? (
                  <div
                    className={`absolute right-0 z-50 min-w-[126px] overflow-hidden rounded-[12px] border border-[#5b5b5b] bg-[#242424] text-left shadow-[0_14px_24px_rgba(0,0,0,0.35)] ${
                      viewModel.rows.length - viewModel.rows.indexOf(row) <= 1 ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"
                    }`}
                  >
                    <Link
                      href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, view: row.id })}
                      className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]"
                    >
                      View
                    </Link>
                    <Link
                      href={buildScriptureOfTheDayHref({
                        tab: viewModel.activeTab,
                        q: viewModel.searchQuery,
                        edit: String(row.id),
                        scripture: row.scripture,
                        prayer: row.prayer,
                        bibleText: row.bibleText,
                        bibleVersion: row.bibleVersion,
                      })}
                      className="block border-b border-white/10 px-4 py-2 text-[14px] text-white/90 hover:bg-white/[0.04]"
                    >
                      Edit
                    </Link>
                    <Link
                      href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery, remove: row.id })}
                      className="block w-full px-4 py-2 text-left text-[14px] text-[#ef4335] hover:bg-white/[0.04]"
                    >
                      Delete
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-4 text-[12px] text-white/65">
          <span>{viewModel.showingLabel}</span>
          <div className="flex gap-3">
            <button type="button" className="rounded-[8px] border border-white/20 px-4 py-2 text-white/45">
              Previous
            </button>
            <button type="button" className="rounded-[8px] border border-[#9B68D5] px-5 py-2 text-[#d8b8ff]">
              Next
            </button>
          </div>
        </div>
      </div>

      {viewModel.showActionMenu && viewModel.selectedRow ? (
        <Link
          href={buildScriptureOfTheDayHref({ tab: viewModel.activeTab, q: viewModel.searchQuery })}
          className="fixed inset-0 z-40"
          aria-label="Close scripture action menu"
        />
      ) : null}
    </div>
  );
}
