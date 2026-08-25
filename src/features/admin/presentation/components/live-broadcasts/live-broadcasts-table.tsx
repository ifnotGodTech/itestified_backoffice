import type {
  ActiveBroadcastRow,
  LiveBroadcastsViewModel,
  ScheduledBroadcastRow,
} from "@/features/admin/domain/entities/live-broadcasts";
import { AdminErrorState } from "@/features/admin/presentation/components/shared/admin-table-primitives";

function TopStatPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#c7ddff] bg-[#eef5ff] px-4 py-[10px] text-[14px] font-medium text-[#276ef1]">
      {label}
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4335] opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ef4335]" />
    </span>
  );
}

function MinistryCell({ name, avatar }: { name: string; avatar: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable avatar hosts
        <img src={avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9B68D5]/20 text-[12px] font-semibold text-[#c590ff]">
          {initial}
        </span>
      )}
      <span className="truncate text-white/86">{name}</span>
    </div>
  );
}

function ActiveBroadcastsSection({ rows }: { rows: ActiveBroadcastRow[] }) {
  const tableGridClass = "grid min-w-[920px] grid-cols-[1.4fr_1.2fr_120px_100px_110px_1.2fr]";

  return (
    <div className="relative rounded-[16px] border border-white/10 bg-[var(--color-surface-elevated)] shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <LiveDot />
          <h2 className="text-[17px] font-semibold text-white">Live Now</h2>
        </div>
        <TopStatPill label={`Broadcasting (${rows.length})`} />
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-8 py-14 text-center text-[15px] text-white/60">No Ministry is broadcasting right now.</div>
        ) : (
          <>
            <div className={`${tableGridClass} bg-[var(--color-surface-elevated)] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
              <span>Ministry / Title</span>
              <span>Started</span>
              <span>Elapsed</span>
              <span>Viewers</span>
              <span>Caps</span>
              <span>Minutes used this month</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[16px] text-[12px] text-white/86`}
              >
                <div className="flex flex-col gap-1 pr-4">
                  <MinistryCell name={row.ministryName} avatar={row.ministryAvatar} />
                  <span className="truncate pl-11 text-[11px] text-white/50">{row.title}</span>
                </div>
                <span className="text-white/72">{row.startedAtLabel}</span>
                <span>{row.elapsedLabel}</span>
                <span>{row.viewerCount === null ? "—" : row.viewerCount.toLocaleString()}</span>
                <span className="text-white/60">
                  {row.maxViewersApplied ?? "—"} viewers / {row.maxDurationMinutesApplied ?? "—"} min
                </span>
                <span>
                  {row.reservedMinutesThisMonth.toLocaleString()} / {row.totalAllowanceMinutes.toLocaleString()} min
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ScheduledBroadcastsSection({ rows }: { rows: ScheduledBroadcastRow[] }) {
  const tableGridClass = "grid min-w-[640px] grid-cols-[1.4fr_1fr]";

  return (
    <div className="relative rounded-[16px] border border-white/10 bg-[var(--color-surface-elevated)] shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <h2 className="text-[17px] font-semibold text-white">Scheduled / Upcoming</h2>
        <TopStatPill label={`Scheduled (${rows.length})`} />
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-8 py-14 text-center text-[15px] text-white/60">Nothing scheduled.</div>
        ) : (
          <>
            <div className={`${tableGridClass} bg-[var(--color-surface-elevated)] px-4 py-[12px] text-[11px] font-medium text-white/72`}>
              <span>Ministry / Title</span>
              <span>Scheduled For</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.id}
                className={`${tableGridClass} items-center border-t border-white/8 px-4 py-[16px] text-[12px] text-white/86`}
              >
                <div className="flex flex-col gap-1 pr-4">
                  <MinistryCell name={row.ministryName} avatar={row.ministryAvatar} />
                  <span className="truncate pl-11 text-[11px] text-white/50">{row.title}</span>
                </div>
                <span className="text-white/72">{row.scheduledAtLabel}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function LiveBroadcastsTable({
  viewModel,
  isRefreshing,
}: {
  viewModel: LiveBroadcastsViewModel;
  isRefreshing: boolean;
}) {
  return (
    <div className="max-w-[1248px] pt-6 md:pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-[1.2] text-[var(--color-text-primary)]">{viewModel.pageTitle}</h1>
          <p className="mt-2 text-[15px] text-white/50">{viewModel.pageDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TopStatPill
            label={`Cap: ${viewModel.policyMaxConcurrentViewers} viewers / ${viewModel.policyMaxDurationMinutes} min`}
          />
          <span className={`text-[12px] transition-opacity ${isRefreshing ? "opacity-100" : "opacity-0"} text-white/40`}>
            Refreshing…
          </span>
        </div>
      </div>

      {viewModel.phaseState === "error" ? (
        <div className="mt-7">
          <AdminErrorState title="Unable to load live broadcasts" message={viewModel.errorMessage} />
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-7">
          <ActiveBroadcastsSection rows={viewModel.active} />
          <ScheduledBroadcastsSection rows={viewModel.scheduled} />
        </div>
      )}
    </div>
  );
}
