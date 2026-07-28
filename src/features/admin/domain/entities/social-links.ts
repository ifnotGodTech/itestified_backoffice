import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type SocialLinkPlatform = "instagram" | "facebook" | "x" | "tiktok" | "youtube" | "whatsapp";

export type SocialLinkState = "populated" | "error" | "success" | "validation";

export type SocialLinkRow = {
  platform: SocialLinkPlatform;
  url: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type SocialLinkViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  state: SocialLinkState;
  rows: SocialLinkRow[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
