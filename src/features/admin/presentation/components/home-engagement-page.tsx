import Link from "next/link";
import type {
  HomeEngagementDayBar,
  HomeEngagementPeriod,
  HomeEngagementViewModel,
} from "@/features/admin/domain/entities/home-engagement";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";

// Theme tokens throughout, so the page reads right in light and dark mode.
const CARD = "rounded-[14px] bg-[var(--color-surface-elevated)] shadow-[0_0_0_1px_var(--color-border-subtle)]";

const PERIODS: { value: HomeEngagementPeriod; label: string }[] = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

function PeriodSwitch({ period }: { period: HomeEngagementPeriod }) {
  return (
    <nav aria-label="Period" className="flex gap-1 rounded-[10px] bg-[var(--color-surface-muted)] p-1">
      {PERIODS.map((option) => {
        const selected = option.value === period;
        return (
          <Link
            key={option.value}
            href={option.value === 7 ? "/analytics/home" : `/analytics/home?period=${option.value}`}
            aria-current={selected ? "page" : undefined}
            className={`rounded-[8px] px-3.5 py-2 text-[13.5px] ${
              selected ? "bg-[var(--color-primary)] font-bold" : "hover:bg-[var(--color-surface-elevated)]"
            }`}
          >
            {/* Links inherit their colour (globals.css), so it goes on the text. */}
            <span className={selected ? "text-[#ffffff]" : "text-[var(--color-text-secondary)]"}>{option.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function DailyChart({ days }: { days: HomeEngagementDayBar[] }) {
  const highest = Math.max(1, ...days.map((day) => day.itemsViewed));
  // Seven bars have room for every label and count; longer periods label
  // about one bar in seven.
  const dense = days.length > 14;
  const labelEvery = dense ? Math.ceil(days.length / 7) : 1;
  return (
    <section aria-label="Each day" className={`flex flex-col gap-4 px-6 py-5 ${CARD}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">Each day</h2>
        <div className="flex gap-4 text-[13px] text-[var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-primary)]" />
            Testimonies viewed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-warning)]" />
            Responses
          </span>
        </div>
      </div>
      <div className="flex h-[260px] items-end gap-[3px] border-b border-[var(--color-border-subtle)] pb-1 sm:gap-3">
        {days.map((day) => (
          <div
            key={day.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            title={`${day.label}: ${day.itemsViewed} viewed, ${day.responses} responses`}
          >
            {!dense && <span className="text-[12px] font-semibold text-[var(--color-warning)]">{day.responses}</span>}
            <span
              className={`w-full rounded-t-[6px] ${day.isToday ? "bg-[var(--color-primary)]/55" : "bg-[var(--color-primary)]"}`}
              style={{ height: `${Math.max(2, (day.itemsViewed / highest) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] text-center text-[12.5px] text-[var(--color-text-secondary)] sm:gap-3">
        {days.map((day, index) => (
          // Only about one bar in seven is labelled when dense, so a label may
          // spill over its unlabelled neighbours rather than be cut short.
          <span key={day.label} className={`min-w-0 flex-1 whitespace-nowrap ${dense ? "overflow-visible" : "truncate"}`}>
            {index % labelEvery === 0 || day.isToday ? day.label : ""}
          </span>
        ))}
      </div>
    </section>
  );
}

export function HomeEngagementPage({ viewModel }: { viewModel: HomeEngagementViewModel }) {
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="flex max-w-[1080px] flex-col gap-6 pt-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--color-text-primary)]">Home engagement</h1>
            <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)]">How people use the Home feed in the app.</p>
          </div>
          <PeriodSwitch period={viewModel.period} />
        </header>

        {viewModel.phaseState === "error" ? (
          <AdminErrorState title="Home engagement isn't available" message={viewModel.errorMessage} />
        ) : (
          <>
            {viewModel.phaseState === "empty" && (
              <p role="status" className={`px-5 py-4 text-[14px] leading-6 text-[var(--color-text-secondary)] ${CARD}`}>
                No Home activity in this period yet. Numbers appear as people use the app build with the new Home feed.
              </p>
            )}
            <section aria-label="Key numbers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {viewModel.numbers.map((number) => (
                <article key={number.label} aria-label={number.label} className={`p-5 ${CARD}`}>
                  <p className="text-[13px] font-semibold text-[var(--color-text-secondary)]">{number.label}</p>
                  <p className="mt-2.5 text-[34px] font-bold leading-none text-[var(--color-text-primary)]">{number.value}</p>
                  <p className="mt-2.5 text-[13px] leading-[1.45] text-[var(--color-text-secondary)]">{number.meaning}</p>
                </article>
              ))}
            </section>
            <DailyChart days={viewModel.days} />
            <p className="text-[12.5px] text-[var(--color-text-muted)]">
              Guests are counted by an anonymous id for their install; nothing here identifies a person. Today&apos;s bar
              is still filling in.
            </p>
          </>
        )}
      </div>
    </AdminDashboardShell>
  );
}
