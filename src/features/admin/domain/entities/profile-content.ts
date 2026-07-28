import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type ProfileContentKey = "about_us" | "terms_of_use" | "privacy_policy";

export type ProfileContentState = "populated" | "error" | "success" | "validation";

export type ProfileContentRow = {
  key: ProfileContentKey;
  body: string;
  updatedAt: string | null;
};

export type ProfileContentViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  state: ProfileContentState;
  rows: ProfileContentRow[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
