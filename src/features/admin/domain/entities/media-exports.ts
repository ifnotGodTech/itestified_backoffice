import type { AdminShellViewModel } from "./shell";

export type MediaExportStatus = "pending" | "processing" | "done" | "failed";

export type MediaExportBranding = {
  id: number;
  logoUrl: string;
  watermarkText: string;
  callToAction: string;
  endCardUrl: string;
  isEnabled: boolean;
  version: number;
  updatedBy: number | null;
  updatedAt: string | null;
};

export type BrandedVideoExportRow = {
  id: number;
  testimonyId: number;
  testimonyTitle: string;
  brandingVersion: number;
  status: MediaExportStatus;
  brandedVideoUrl: string;
  errorMessage: string;
  retryCount: number;
  updatedAt: string | null;
};

export type MediaExportViewModel = {
  shell: AdminShellViewModel;
  branding: MediaExportBranding;
  rows: BrandedVideoExportRow[];
  total: number;
  state: "populated" | "success" | "error";
  errorMessage?: string;
  successMessage?: string;
};
