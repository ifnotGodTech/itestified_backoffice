import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type AnalyticsArea = "testimonies" | "users" | "donations";
export type TestimonyMode = "text" | "video";
export type AnalyticsState = "populated" | "empty" | "loading" | "error";

export type AnalyticsMetric = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
};

export type AnalyticsSeriesPoint = {
  label: string;
  valueA: number;
  valueB?: number;
  accent?: boolean;
};

export type AnalyticsCategoryRow = {
  category: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
};

export type AnalyticsTopRow = {
  title: string;
  metricA: string;
  metricB: string;
  actionLabel?: string;
};

export type AnalyticsViewModel = {
  shell: AdminShellViewModel;
  area: AnalyticsArea;
  testimonyMode: TestimonyMode;
  phaseState: AnalyticsState;
  pageTitle: string;
  pageDescription: string;
  exportLabel: string;
  periods: string[];
  selectedPeriod: string;
  metrics: AnalyticsMetric[];
  chartTitle: string;
  chartSubtitle: string;
  chartPoints: AnalyticsSeriesPoint[];
  secondaryChartTitle?: string;
  secondaryChartSubtitle?: string;
  secondaryChartPoints?: AnalyticsSeriesPoint[];
  categoryTableTitle?: string;
  categoryTableSubtitle?: string;
  categoryRows?: AnalyticsCategoryRow[];
  donutTitle?: string;
  donutSubtitle?: string;
  donutSegments?: Array<{ label: string; value: string; color: string }>;
  topListTitle?: string;
  topListSubtitle?: string;
  topRows?: AnalyticsTopRow[];
  errorMessage?: string;
};
