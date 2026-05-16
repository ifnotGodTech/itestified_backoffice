import Link from "next/link";
import type { ReactNode } from "react";
import type { AnalyticsSeriesPoint, AnalyticsViewModel } from "@/features/admin/domain/entities/analytics";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";
import { buildAnalyticsHref } from "@/features/admin/presentation/state/analytics-route-state";

function ExportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
      <path d="M8 2.5v6.25m0 0 2.25-2.25M8 8.75 5.75 6.5M3 10.25v1.25c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25v-1.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/70" fill="none">
      <path d="M5.25 2.5v1.5M10.75 2.5v1.5M3.5 5h9M4.25 13h7.5c.69 0 1.25-.56 1.25-1.25v-6.5C13 4.56 12.44 4 11.75 4h-7.5C3.56 4 3 4.56 3 5.25v6.5C3 12.44 3.56 13 4.25 13Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function PeriodDropdown({ viewModel }: { viewModel: AnalyticsViewModel }) {
  return (
    <details className="group relative inline-block">
      <summary className="flex h-[28px] cursor-pointer list-none items-center gap-2 rounded-[6px] bg-[#262626] px-3 text-[10px] text-white/75 marker:content-none">
        <CalendarIcon />
        <span>Time Period</span>
        <span>{viewModel.selectedPeriod}</span>
        <span className="text-white/50 transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="absolute left-0 top-[34px] z-20 min-w-[156px] overflow-hidden rounded-[8px] border border-white/8 bg-[#202020] shadow-[0_18px_30px_rgba(0,0,0,0.45)]">
        {viewModel.periods.map((period) => (
          <Link
            key={period}
            href={buildAnalyticsHref({
              area: viewModel.area === "testimonies" ? undefined : viewModel.area,
              mode: viewModel.area === "testimonies" ? viewModel.testimonyMode : undefined,
              period,
              state: viewModel.phaseState === "populated" ? undefined : viewModel.phaseState,
            })}
            className={`block px-3 py-2 text-[10px] ${viewModel.selectedPeriod === period ? "bg-[#2a2234] text-[#d6b2ff]" : "text-white/75 hover:bg-white/5"}`}
          >
            {period}
          </Link>
        ))}
      </div>
    </details>
  );
}

function MetricIcon({ user, label }: { user?: boolean; label: string }) {
  if (user) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
        <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.5 6.5a5.5 5.5 0 0 1 11 0M15.5 9.5a2.25 2.25 0 1 0 0-4.5M16.75 16.25c-.14-1.2-.74-2.28-1.67-3.03" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (/approved/i.test(label)) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="m7.5 10 1.75 1.75L12.75 8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (/rejected/i.test(label)) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
        <path d="m7 7 6 6m0-6-6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" />
      </svg>
    );
  }

  if (/pending|watch time/i.test(label)) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 6.75v3.5l2.25 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (/view/i.test(label)) {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
        <path d="M3.2 10s2.4-4 6.8-4 6.8 4 6.8 4-2.4 4-6.8 4-6.8-4-6.8-4Z" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 text-white/75" fill="none">
      <path d="M10.5 3.5h-4A1.5 1.5 0 0 0 5 5v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 15 15V8l-4.5-4.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      <path d="M10.5 3.5V8H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function MetricCard({ metric, user }: { metric: AnalyticsViewModel["metrics"][number]; user?: boolean }) {
  const trendColor = metric.trend === "up" ? "text-[#27c45b]" : metric.trend === "down" ? "text-[#ef4335]" : "text-white/45";
  return (
    <div className="rounded-[8px] bg-[#181818] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] text-white/62">{metric.label}</p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-white">{metric.value}</p>
          <p className={`mt-3 text-[9px] ${trendColor}`}>{metric.change}</p>
        </div>
        <MetricIcon user={user} label={metric.label} />
      </div>
    </div>
  );
}

function LineChart({ points, dual = false }: { points: AnalyticsSeriesPoint[]; dual?: boolean }) {
  const width = 820;
  const height = dual ? 220 : 250;
  const padX = 42;
  const padY = 24;
  const max = Math.max(...points.flatMap((p) => [p.valueA, p.valueB ?? 0]), 1);
  const xStep = (width - padX * 2) / Math.max(points.length - 1, 1);
  const y = (value: number) => height - padY - (value / max) * (height - padY * 2);
  const linePath = (key: "valueA" | "valueB") =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${padX + i * xStep} ${y((p[key] as number) ?? 0)}`)
      .join(" ");
  const areaPath = (key: "valueA" | "valueB") => {
    const startX = padX;
    const endX = padX + (points.length - 1) * xStep;
    return `${linePath(key)} L ${endX} ${height - padY} L ${startX} ${height - padY} Z`;
  };
  const axisLabels = Array.from({ length: 5 }, (_, idx) => Math.round((max / 4) * (4 - idx)));

  return (
    <div className="rounded-[12px] bg-[#1b1b1b] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${dual ? "h-[220px]" : "h-[250px]"}`}>
        <defs>
          <linearGradient id="analyticsPrimaryFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9966CC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#9966CC" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="analyticsSecondaryFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D4C45A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D4C45A" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = padY + ((height - padY * 2) / 4) * i;
          return (
            <g key={i}>
              <line x1={padX} x2={width - padX} y1={yy} y2={yy} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <text x={padX - 14} y={yy + 3} fill="rgba(255,255,255,0.34)" fontSize="9" textAnchor="end">
                {axisLabels[i]}
              </text>
            </g>
          );
        })}
        <path d={areaPath("valueA")} fill="url(#analyticsPrimaryFill)" />
        {dual ? <path d={areaPath("valueB")} fill="url(#analyticsSecondaryFill)" /> : null}
        <path d={linePath("valueA")} fill="none" stroke="#9966CC" strokeWidth="3" strokeLinecap="round" />
        {dual ? <path d={linePath("valueB")} fill="none" stroke="#D4C45A" strokeWidth="3" strokeLinecap="round" /> : null}
        {points.map((p, i) => (
          <circle key={p.label} cx={padX + i * xStep} cy={y(p.valueA)} r="4" fill={p.accent ? "#ef4335" : "#9966CC"} />
        ))}
      </svg>
      <div className="mt-2 flex justify-between pl-[18px] text-[10px] text-white/45">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-[12px] bg-[#1b1b1b] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <h3 className="text-[14px] font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-[10px] text-white/45">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 text-[10px] text-white/58">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function DonutLegend({ viewModel }: { viewModel: AnalyticsViewModel }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px]">
      {viewModel.donutSegments?.map((segment) => (
        <div key={segment.label} className="flex items-start gap-2 text-white/72">
          <span className="mt-1 h-[8px] w-[8px] rounded-full" style={{ backgroundColor: segment.color }} />
          <div>
            <p>{segment.label}</p>
            <p className="mt-1 whitespace-pre-line text-white/45">{segment.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ viewModel }: { viewModel: AnalyticsViewModel }) {
  const segments = viewModel.donutSegments ?? [];
  return (
    <SectionCard title={viewModel.donutTitle ?? ""} subtitle={viewModel.donutSubtitle}>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <div className="relative h-[160px] w-[160px] rounded-full" style={{ background: `conic-gradient(${segments.map((s, i) => `${s.color} ${i * (100 / segments.length)}% ${(i + 1) * (100 / segments.length)}%`).join(", ")})` }}>
          <div className="absolute inset-[24px] rounded-full bg-[#1b1b1b]" />
        </div>
        <div className="flex-1">
          <DonutLegend viewModel={viewModel} />
        </div>
      </div>
    </SectionCard>
  );
}

function CategoryTable({ viewModel }: { viewModel: AnalyticsViewModel }) {
  const showViews = Boolean(viewModel.categoryRows?.some((row) => typeof row.views === "number"));
  const gridClass = showViews ? "grid-cols-[1.4fr_repeat(4,1fr)]" : "grid-cols-[1.6fr_repeat(3,1fr)]";
  return (
    <SectionCard title={viewModel.categoryTableTitle ?? ""} subtitle={viewModel.categoryTableSubtitle}>
      <div className="overflow-hidden rounded-[8px] border border-white/8">
        <div className={`grid ${gridClass} bg-[#262626] px-3 py-2 text-[10px] text-white/82`}>
          <span>Category ↕</span>
          <span>Likes ↕</span>
          <span>Comments ↕</span>
          <span>Shares ↕</span>
          {showViews ? <span>Views ↕</span> : null}
        </div>
        {viewModel.categoryRows?.map((row) => (
          <div key={row.category} className={`grid ${gridClass} border-t border-white/8 px-3 py-2 text-[10px] text-white/68`}>
            <span>{row.category}</span>
            <span>{row.likes}</span>
            <span>{row.comments}</span>
            <span>{row.shares}</span>
            {showViews ? <span>{row.views}</span> : null}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TopList({ viewModel }: { viewModel: AnalyticsViewModel }) {
  return (
    <SectionCard title={viewModel.topListTitle ?? ""} subtitle={viewModel.topListSubtitle}>
      <div className="overflow-hidden rounded-[8px] border border-white/8">
        <div className="grid grid-cols-[1.9fr_70px_70px_52px] bg-[#262626] px-3 py-2 text-[10px] text-white/82">
          <span>Title ↕</span>
          <span>Likes ↕</span>
          <span>Views ↕</span>
          <span>Action</span>
        </div>
        {viewModel.topRows?.map((row, idx) => (
          <div key={`${row.title}-${idx}`} className="grid grid-cols-[1.9fr_70px_70px_52px] border-t border-white/8 px-3 py-2 text-[10px] text-white/68">
            <span className="truncate">{row.title}</span>
            <span>{row.metricA}</span>
            <span>{row.metricB}</span>
            <span className="text-[#9B68D5]">{row.actionLabel}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function AnalyticsPage({ viewModel }: { viewModel: AnalyticsViewModel }) {
  const isTestimonies = viewModel.area === "testimonies";
  return (
    <AdminDashboardShell viewModel={viewModel.shell}>
      <div className="max-w-[1248px] pt-6 md:pt-8">
        <div className="flex items-start justify-between gap-4 rounded-[8px] bg-[#0c0c0c] px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div>
            <h1 className="text-[22px] font-semibold text-white">{viewModel.pageTitle}</h1>
            <p className="mt-2 text-[10px] text-white/45">{viewModel.pageDescription}</p>
          </div>
          <button type="button" className="inline-flex h-[28px] items-center gap-1.5 rounded-[6px] border border-[#9B68D5] px-3 text-[10px] text-[#b27bff]">
            <ExportIcon />
            {viewModel.exportLabel}
          </button>
        </div>

        {isTestimonies ? (
          <div className="mt-4 flex items-center gap-2">
            {(["text", "video"] as const).map((mode) => (
              <Link
                key={mode}
                href={buildAnalyticsHref({ area: "testimonies", mode, period: viewModel.selectedPeriod })}
                className={`inline-flex h-[20px] items-center rounded-[4px] px-4 text-[9px] ${viewModel.testimonyMode === mode ? "bg-[#9966CC] text-white" : "bg-[#2a2a2a] text-white/70"}`}
              >
                {mode === "text" ? "Text" : "Video"}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-4 rounded-[8px] bg-[#1b1b1b] px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <PeriodDropdown viewModel={viewModel} />
        </div>

        {viewModel.phaseState === "loading" ? <div className="mt-6 rounded-[12px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">Loading analytics...</div> : null}
        {viewModel.phaseState === "error" ? <div className="mt-6 rounded-[12px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">{viewModel.errorMessage}</div> : null}
        {viewModel.phaseState === "empty" ? <div className="mt-6 rounded-[12px] bg-[#1b1b1b] px-6 py-16 text-center text-white/60">No analytics data available yet.</div> : null}

        {viewModel.phaseState === "populated" ? (
          <>
            <div className={`mt-4 grid gap-4 ${viewModel.area === "users" || viewModel.area === "donations" ? "grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
              {viewModel.metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} user={viewModel.area !== "testimonies"} />
              ))}
            </div>

            <div className="mt-4">
              <SectionCard title={viewModel.chartTitle} subtitle={viewModel.chartSubtitle}>
                {viewModel.area === "testimonies" ? <ChartLegend items={[{ label: "Views", color: "#9966CC" }, { label: "Engagement", color: "#D4C45A" }]} /> : null}
                <LineChart points={viewModel.chartPoints} dual={viewModel.area === "testimonies"} />
              </SectionCard>
            </div>

            {viewModel.secondaryChartPoints ? (
              <div className="mt-4">
                <SectionCard title={viewModel.secondaryChartTitle ?? ""} subtitle={viewModel.secondaryChartSubtitle}>
                  <ChartLegend items={[{ label: "Registered Users", color: "#9966CC" }, { label: "Active Users", color: "#D4C45A" }]} />
                  <LineChart points={viewModel.secondaryChartPoints} dual />
                </SectionCard>
              </div>
            ) : null}

            {viewModel.categoryRows ? (
              <div className="mt-4">
                <CategoryTable viewModel={viewModel} />
              </div>
            ) : null}

            {viewModel.donutSegments || viewModel.topRows ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
                {viewModel.donutSegments ? <DonutChart viewModel={viewModel} /> : null}
                {viewModel.topRows ? <TopList viewModel={viewModel} /> : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AdminDashboardShell>
  );
}
