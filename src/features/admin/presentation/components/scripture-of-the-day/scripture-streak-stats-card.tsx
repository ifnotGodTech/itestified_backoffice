import type { ScriptureStreakStats } from "@/features/admin/domain/entities/scripture-of-the-day";

// Phase 17 Slice 4: a small, real-data stats strip so an admin can tell
// whether the mobile streak feature is actually being used, without
// needing the full Phase 8 analytics dashboard to exist first.
export function ScriptureStreakStatsCard({ stats }: { stats: ScriptureStreakStats }) {
  const buckets: Array<{ label: string; count: number }> = [
    { label: "1-3 days", count: stats.streakLengthDistribution.oneToThreeDays },
    { label: "4-7 days", count: stats.streakLengthDistribution.fourToSevenDays },
    { label: "8-30 days", count: stats.streakLengthDistribution.eightToThirtyDays },
    { label: "31+ days", count: stats.streakLengthDistribution.thirtyOnePlusDays },
  ];

  return (
    <div className="mb-4 rounded-[8px] bg-[var(--color-surface-elevated)] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <p className="text-[10px] text-white/62">Active Scripture Streaks</p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-white">{stats.activeStreakUserCount}</p>
          <p className="mt-2 text-[9px] text-white/45">Read today or yesterday</p>
        </div>
        <div className="flex flex-1 flex-wrap gap-3">
          {buckets.map((bucket) => (
            <div
              key={bucket.label}
              className="min-w-[104px] flex-1 rounded-[8px] border border-white/8 px-3 py-2.5"
            >
              <p className="text-[9px] text-white/50">{bucket.label}</p>
              <p className="mt-1 text-[18px] font-semibold text-white">{bucket.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
