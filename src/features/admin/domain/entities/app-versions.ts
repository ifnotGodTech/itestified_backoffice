import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type AppVersionPlatform = "android" | "ios";

export type AppVersionState = "populated" | "error" | "success" | "validation" | "notified";

export type AppVersionRow = {
  platform: AppVersionPlatform;
  minimumVersion: string;
  latestVersion: string;
  updatedAt: string | null;
};

export type AppVersionViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: AppVersionState;
  rows: AppVersionRow[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
  notifiedMessage?: string;
};
