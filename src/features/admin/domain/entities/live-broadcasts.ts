import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type LiveBroadcastsPhaseState = "populated" | "empty" | "error";

export type ActiveBroadcastRow = {
  id: number;
  title: string;
  ministryName: string;
  ministryAvatar: string;
  startedAtLabel: string;
  elapsedLabel: string;
  viewerCount: number | null;
  maxViewersApplied: number | null;
  maxDurationMinutesApplied: number | null;
  reservedMinutesThisMonth: number;
  totalAllowanceMinutes: number;
  remainingAllowanceMinutes: number;
};

export type ScheduledBroadcastRow = {
  id: number;
  title: string;
  ministryName: string;
  ministryAvatar: string;
  scheduledAtLabel: string;
};

export type LiveBroadcastsViewModel = {
  shell: AdminShellViewModel;
  phaseState: LiveBroadcastsPhaseState;
  pageTitle: string;
  pageDescription: string;
  active: ActiveBroadcastRow[];
  scheduled: ScheduledBroadcastRow[];
  policyMaxConcurrentViewers: number;
  policyMaxDurationMinutes: number;
  errorMessage?: string;
};
