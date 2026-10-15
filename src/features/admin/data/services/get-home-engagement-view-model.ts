import { backendBaseUrl } from "@/core/auth/backend";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type {
  HomeEngagementDayBar,
  HomeEngagementNumber,
  HomeEngagementPeriod,
  HomeEngagementViewModel,
} from "@/features/admin/domain/entities/home-engagement";

type SummaryPayload = {
  days: number;
  median_view_ms: number;
  swipes_per_session: number | null;
  searches_per_day: number;
  search_play_rate: number | null;
  response_rate: number | null;
  items_viewed: number;
  sessions: number;
  series: { day: string; items_viewed: number; responses: number }[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function normalizePeriod(value?: string): HomeEngagementPeriod {
  return value === "30" ? 30 : value === "90" ? 90 : 7;
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

function formatPercent(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

function dayLabel(isoDay: string, isToday: boolean): string {
  if (isToday) return "Today";
  const date = new Date(`${isoDay}T00:00:00Z`);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()}`;
}

/** The four numbers, each with the sentence that says what it means. */
export function toNumbers(summary: SummaryPayload): HomeEngagementNumber[] {
  const searches =
    summary.searches_per_day >= 10 ? String(Math.round(summary.searches_per_day)) : String(summary.searches_per_day);
  return [
    {
      label: "Time on a testimony",
      value: formatDuration(summary.median_view_ms),
      meaning: "Half of the testimonies people saw held them longer than this.",
    },
    {
      label: "Swipes per visit",
      value: summary.swipes_per_session === null ? "—" : summary.swipes_per_session.toFixed(1),
      meaning: "How many testimonies a visit moves through, on average.",
    },
    {
      label: "Searches a day",
      value: searches,
      meaning:
        summary.search_play_rate === null
          ? "No searches in this period yet."
          : `${formatPercent(summary.search_play_rate)} of searches led to a result being played.`,
    },
    {
      label: "Response rate",
      value: formatPercent(summary.response_rate),
      meaning: "Testimonies viewed that got a reaction or a comment.",
    },
  ];
}

export function toDays(summary: SummaryPayload): HomeEngagementDayBar[] {
  const last = summary.series.length - 1;
  return summary.series.map((entry, index) => ({
    label: dayLabel(entry.day, index === last),
    itemsViewed: entry.items_viewed,
    responses: entry.responses,
    isToday: index === last,
  }));
}

export async function getHomeEngagementViewModelFromApi(
  input: { period?: string; fullName?: string },
  cookieHeader: string,
): Promise<HomeEngagementViewModel> {
  const period = normalizePeriod(input.period);
  const base: HomeEngagementViewModel = {
    shell: getAdminShellViewModel({
      activeHref: "/analytics",
      activeChildHref: "/analytics/home",
      fullName: input.fullName,
    }),
    period,
    phaseState: "populated",
    numbers: [],
    days: [],
  };
  const headers: Record<string, string> = cookieHeader ? { cookie: cookieHeader } : {};
  try {
    const response = await fetch(`${backendBaseUrl}/engagement/admin/home/?days=${period}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) {
      return { ...base, phaseState: "error", errorMessage: "We could not load Home engagement right now. Please try again." };
    }
    const summary = (await response.json()) as SummaryPayload;
    const nothingYet = summary.items_viewed === 0 && summary.sessions === 0;
    return {
      ...base,
      phaseState: nothingYet ? "empty" : "populated",
      numbers: toNumbers(summary),
      days: toDays(summary),
    };
  } catch {
    return { ...base, phaseState: "error", errorMessage: "We could not load Home engagement right now. Please try again." };
  }
}
