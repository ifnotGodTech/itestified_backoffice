import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

// Phase 35 Slice 5: how people use the Home feed in the app.

export type HomeEngagementPeriod = 7 | 30 | 90;

export type HomeEngagementNumber = {
  label: string;
  value: string;
  /** What the number means, in a sentence. */
  meaning: string;
};

export type HomeEngagementDayBar = {
  label: string;
  itemsViewed: number;
  responses: number;
  isToday: boolean;
};

export type HomeEngagementViewModel = {
  shell: AdminShellViewModel;
  period: HomeEngagementPeriod;
  phaseState: "populated" | "empty" | "error";
  numbers: HomeEngagementNumber[];
  days: HomeEngagementDayBar[];
  errorMessage?: string;
};
