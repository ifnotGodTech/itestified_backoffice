import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  AnalyticsArea,
  AnalyticsMetric,
  AnalyticsSeriesPoint,
  AnalyticsState,
  AnalyticsTopRow,
  AnalyticsViewModel,
  TestimonyMode,
} from "@/features/admin/domain/entities/analytics";

function normalizeArea(area?: string): AnalyticsArea {
  if (area === "users" || area === "donations") return area;
  return "testimonies";
}

function normalizeMode(mode?: string): TestimonyMode {
  return mode === "video" ? "video" : "text";
}

function normalizeState(state?: string): AnalyticsState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

const periods = ["Last 7 days", "Jan 2024", "Jun 2024"];

function formatPercent(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 1000) / 10;
}

const testimonyMetrics = {
  text: [
    { label: "Total Submissions", value: "15,000", change: "+ 5.25% from last period", trend: "up" },
    { label: "Approved Testimonies", value: "1000", change: "+ 4.50% from last period", trend: "up" },
    { label: "Rejected testimonies", value: "200", change: "+ 4.25% from last period", trend: "up" },
    { label: "Pending Review", value: "60", change: "+ 6.5% from last period", trend: "up" },
  ] satisfies AnalyticsMetric[],
  video: [
    { label: "Total Views", value: "15,000", change: "+ 5.25% from last period", trend: "up" },
    { label: "Watch Time", value: "15,000", change: "+ 4.50% from last period", trend: "up" },
  ] satisfies AnalyticsMetric[],
};

const testimonyChart: AnalyticsSeriesPoint[] = [
  { label: "Week 1", valueA: 2, valueB: 5 },
  { label: "24 Jun", valueA: 5, valueB: 4 },
  { label: "27 Jun", valueA: 3, valueB: 8 },
  { label: "28 Jun", valueA: 7, valueB: 10 },
  { label: "29 Jun", valueA: 8, valueB: 7 },
  { label: "30 Jul", valueA: 10, valueB: 6, accent: true },
  { label: "31 Jul", valueA: 4, valueB: 10 },
];

const userMetrics: AnalyticsMetric[] = [
  { label: "Total Users", value: "15,000", change: "+ 5.2% from last period", trend: "up" },
  { label: "New Users", value: "100", change: "+ 5.3% from last period", trend: "up" },
  { label: "Active Users", value: "3000", change: "- 5.2% from last period", trend: "down" },
  { label: "Deleted Accounts", value: "10", change: "No change from last period", trend: "neutral" },
];

const userGrowth: AnalyticsSeriesPoint[] = [
  { label: "Jun 1", valueA: 100 },
  { label: "Jun 2", valueA: 80 },
  { label: "Jun 3", valueA: 60, accent: true },
  { label: "Jun 4", valueA: 115 },
  { label: "Jun 5", valueA: 88, accent: true },
  { label: "Jun 6", valueA: 50 },
  { label: "Jun 7", valueA: 80 },
];

const userCompare: AnalyticsSeriesPoint[] = [
  { label: "Jun 1", valueA: 420, valueB: 300 },
  { label: "Jun 2", valueA: 400, valueB: 320 },
  { label: "Jun 3", valueA: 580, valueB: 500 },
  { label: "Jun 4", valueA: 590, valueB: 360 },
  { label: "Jun 5", valueA: 700, valueB: 520 },
  { label: "Jun 6", valueA: 650, valueB: 340 },
  { label: "Jun 7", valueA: 720, valueB: 460 },
];

const donationMetrics: AnalyticsMetric[] = [
  { label: "Total Donations", value: "₦1,000,000", change: "+ 7.4% from last period", trend: "up" },
  { label: "Successful Donations", value: "350", change: "+ 5.1% from last period", trend: "up" },
  { label: "Pending Donations", value: "22", change: "- 2.4% from last period", trend: "down" },
  { label: "Refunded", value: "8", change: "No change from last period", trend: "neutral" },
];

const CATEGORY_ENGAGEMENT = [
  { category: "Healing", likes: 320, comments: 145, shares: 88, posts: 220, color: "#D84DFF" },
  { category: "Deliverance", likes: 210, comments: 96, shares: 54, posts: 140, color: "#8A54FF" },
  { category: "Breakthrough", likes: 175, comments: 80, shares: 41, posts: 95, color: "#FF49A6" },
  { category: "Faith", likes: 260, comments: 110, shares: 63, posts: 175, color: "#67F0FF" },
  { category: "Finance", likes: 140, comments: 58, shares: 30, posts: 60, color: "#F1D94A" },
  { category: "Salvation", likes: 300, comments: 130, shares: 77, posts: 190, color: "#6BFFB4" },
  { category: "Career", likes: 95, comments: 40, shares: 18, posts: 45, color: "#FF7A59" },
  { category: "Marriage Restoration", likes: 180, comments: 75, shares: 44, posts: 105, color: "#D84DFF" },
] as const;

const TOP_TESTIMONIES: AnalyticsTopRow[] = [
  { title: "Miraculous Healing from Cancer", metricA: "342", metricB: "1,204", actionLabel: "View" },
  { title: "Delivered from Years of Addiction", metricA: "298", metricB: "980", actionLabel: "View" },
  { title: "God Restored My Marriage", metricA: "265", metricB: "875", actionLabel: "View" },
  { title: "Breakthrough After 10 Years of Waiting", metricA: "240", metricB: "810", actionLabel: "View" },
  { title: "Financial Miracle in My Business", metricA: "198", metricB: "640", actionLabel: "View" },
  { title: "Salvation Testimony: From Darkness to Light", metricA: "175", metricB: "590", actionLabel: "View" },
];

const donationTopRows: AnalyticsTopRow[] = [
  { title: "Flutterwave", metricA: "₦540,000", metricB: "54%", actionLabel: "View" },
  { title: "Paystack", metricA: "₦320,000", metricB: "32%", actionLabel: "View" },
  { title: "Bank Transfer", metricA: "₦140,000", metricB: "14%", actionLabel: "View" },
];

export function getAnalyticsViewModel(input: {
  area?: string;
  mode?: string;
  period?: string;
  state?: string;
  fullName?: string;
}): AnalyticsViewModel {
  const area = normalizeArea(input.area);
  const testimonyMode = normalizeMode(input.mode);
  const phaseState = normalizeState(input.state);
  const selectedPeriod = periods.includes(input.period ?? "") ? (input.period as string) : periods[0];

  if (area === "users") {
    return {
      shell: getAdminShellViewModel({ activeHref: "/analytics", activeChildHref: "/analytics?area=users", fullName: input.fullName }),
      area,
      testimonyMode,
      phaseState,
      pageTitle: "User Analytics",
      pageDescription: "Comprehensive view of user metrics, growth trends, and key performance indicators .",
      exportLabel: "Export as CSV File",
      periods,
      selectedPeriod,
      metrics: userMetrics,
      chartTitle: "User Growth Overview",
      chartSubtitle: "Tracks the true growth of your user base over time, calculated as registrations minus deletions and deactivations.",
      chartPoints: userGrowth,
      secondaryChartTitle: "Registered vs Active Users",
      secondaryChartSubtitle: "Compares your total number of registered users to those who actively used the platform during each time period.",
      secondaryChartPoints: userCompare,
      errorMessage: phaseState === "error" ? "We could not load analytics right now. Please try again." : undefined,
    };
  }

  if (area === "donations") {
    return {
      shell: getAdminShellViewModel({ activeHref: "/analytics", activeChildHref: "/analytics?area=donations", fullName: input.fullName }),
      area,
      testimonyMode,
      phaseState,
      pageTitle: "Donation Analytics",
      pageDescription: "Comprehensive view of donation performance and contribution patterns.",
      exportLabel: "Export as CSV File",
      periods,
      selectedPeriod,
      metrics: donationMetrics,
      chartTitle: "Donation Performance Trends",
      chartSubtitle: "Tracks total donation flow and successful giving across the selected period.",
      chartPoints: testimonyChart,
      donutTitle: "Donation Channels",
      donutSubtitle: "Percentage breakdown of donations by payment method.",
      donutSegments: [
        { label: "Flutterwave", value: "54%", color: "#D84DFF", percent: 54 },
        { label: "Paystack", value: "32%", color: "#55F2C6", percent: 32 },
        { label: "Bank Transfer", value: "14%", color: "#F6D85B", percent: 14 },
      ],
      topListTitle: "Top Donation Sources",
      topListSubtitle: "Highest contribution sources and their share of total donations.",
      topRows: donationTopRows,
      errorMessage: phaseState === "error" ? "We could not load analytics right now. Please try again." : undefined,
    };
  }

  return {
    shell: getAdminShellViewModel({
      activeHref: "/analytics",
      activeChildHref: area === "testimonies" ? "/analytics" : undefined,
      fullName: input.fullName,
    }),
    area,
    testimonyMode,
    phaseState,
    pageTitle: "Testimony Analytics",
    pageDescription: "Comprehensive insights into testimony performance and engagement",
    exportLabel: "Export as CSV File",
    periods,
    selectedPeriod,
    metrics: testimonyMetrics[testimonyMode],
    chartTitle: "Performance Trends",
    chartSubtitle: "Views and engagement over time",
    chartPoints: testimonyChart,
    categoryTableTitle: "Engagement by Category",
    categoryTableSubtitle: "Engagement metrics and interaction breakdown",
    categoryRows: CATEGORY_ENGAGEMENT.map((row) => ({
      category: row.category,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
    })),
    donutTitle: testimonyMode === "text" ? "Text Distribution by Category" : "Video Distribution by Category",
    donutSubtitle: testimonyMode === "text" ? "Percentage breakdown of submitted text testimonies" : "Percentage breakdown of uploaded video testimonies",
    donutSegments: (() => {
      const totalPosts = CATEGORY_ENGAGEMENT.reduce((sum, row) => sum + row.posts, 0);
      return CATEGORY_ENGAGEMENT.map((row) => ({
        label: row.category,
        value: `${row.posts} Posts\n${formatPercent(row.posts, totalPosts)}%`,
        color: row.color,
        percent: formatPercent(row.posts, totalPosts),
      }));
    })(),
    topListTitle: testimonyMode === "text" ? "Top Performing Testimonies" : "Top Performing Videos",
    topListSubtitle: "Highest viewed testimonies with engagement metrics",
    topRows: TOP_TESTIMONIES,
    errorMessage: phaseState === "error" ? "We could not load analytics right now. Please try again." : undefined,
  };
}
