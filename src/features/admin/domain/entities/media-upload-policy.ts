import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type MediaUploadPolicyState = "populated" | "error" | "success" | "validation";
export type MediaUploadPolicySection = "video" | "audio";

export type UploadPolicyForm = {
  maxFileSizeMb: number;
  maxDurationMinutes: number;
  allowedContentTypes: string[];
  dailyLimit: number;
  updatedByName: string;
  updatedAt: string | null;
};

export type MediaUploadPolicyViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: MediaUploadPolicyState;
  bannerSection: MediaUploadPolicySection | null;
  video: UploadPolicyForm;
  audio: UploadPolicyForm;
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
