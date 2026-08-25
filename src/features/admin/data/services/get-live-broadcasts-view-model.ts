import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  ActiveBroadcastRow,
  LiveBroadcastsPhaseState,
  LiveBroadcastsViewModel,
  ScheduledBroadcastRow,
} from "@/features/admin/domain/entities/live-broadcasts";

function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "<1m";
}

function formatDateTimeLabel(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapActiveRow(item: Record<string, unknown>): ActiveBroadcastRow {
  const viewerCount = item.viewer_count;
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? ""),
    ministryName: String(item.ministry_name ?? ""),
    ministryAvatar: String(item.ministry_avatar ?? ""),
    startedAtLabel: formatDateTimeLabel(String(item.started_at ?? "")),
    elapsedLabel: formatElapsed(Number(item.elapsed_seconds ?? 0)),
    viewerCount: typeof viewerCount === "number" ? viewerCount : null,
    maxViewersApplied: item.max_viewers_applied == null ? null : Number(item.max_viewers_applied),
    maxDurationMinutesApplied:
      item.max_duration_minutes_applied == null ? null : Number(item.max_duration_minutes_applied),
    reservedMinutesThisMonth: Number(item.reserved_minutes_this_month ?? 0),
    totalAllowanceMinutes: Number(item.total_allowance_minutes ?? 0),
    remainingAllowanceMinutes: Number(item.remaining_allowance_minutes ?? 0),
  };
}

function mapScheduledRow(item: Record<string, unknown>): ScheduledBroadcastRow {
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? ""),
    ministryName: String(item.ministry_name ?? ""),
    ministryAvatar: String(item.ministry_avatar ?? ""),
    scheduledAtLabel: formatDateTimeLabel(String(item.scheduled_at ?? "")),
  };
}

function errorViewModel(input: { fullName?: string }): LiveBroadcastsViewModel {
  return {
    shell: getAdminShellViewModel({ activeHref: "/live-broadcasts", fullName: input.fullName }),
    phaseState: "error",
    pageTitle: "Live Broadcasts",
    pageDescription: "Monitor active and scheduled Ministry broadcasts.",
    active: [],
    scheduled: [],
    policyMaxConcurrentViewers: 0,
    policyMaxDurationMinutes: 0,
    errorMessage: "We could not load live broadcasts right now. Please try again.",
  };
}

export async function getLiveBroadcastsViewModelFromApi(
  input: { fullName?: string },
  cookieHeader: string,
): Promise<LiveBroadcastsViewModel> {
  try {
    const response = await fetch(`${backendBaseUrl}/live-broadcasts/admin/monitor/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) return errorViewModel(input);

    const payload = (await response.json().catch(() => null)) as {
      active?: Array<Record<string, unknown>>;
      scheduled?: Array<Record<string, unknown>>;
      policy?: { max_concurrent_viewers?: number; max_duration_minutes?: number };
    } | null;
    if (!payload) return errorViewModel(input);

    const active = (payload.active ?? []).map(mapActiveRow);
    const scheduled = (payload.scheduled ?? []).map(mapScheduledRow);
    const phaseState: LiveBroadcastsPhaseState =
      active.length === 0 && scheduled.length === 0 ? "empty" : "populated";

    return {
      shell: getAdminShellViewModel({ activeHref: "/live-broadcasts", fullName: input.fullName }),
      phaseState,
      pageTitle: "Live Broadcasts",
      pageDescription: "Monitor active and scheduled Ministry broadcasts.",
      active,
      scheduled,
      policyMaxConcurrentViewers: Number(payload.policy?.max_concurrent_viewers ?? 0),
      policyMaxDurationMinutes: Number(payload.policy?.max_duration_minutes ?? 0),
    };
  } catch {
    return errorViewModel(input);
  }
}
