import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type AIJobKind = "transcription" | "translation";
export type AIJobStatus = "pending" | "processing" | "done" | "failed";
export type AIJobStatusFilter = AIJobStatus | "all";

export interface AIJobRow {
  id: number;
  kind: AIJobKind;
  testimonyId: number;
  testimonyTitle: string;
  language: string | null;
  status: AIJobStatus;
  errorMessage: string;
  retryCount: number;
  updatedAt: string;
  updatedAtLabel: string;
}

export type AIJobsPhaseState = "populated" | "empty" | "error";

export interface AIJobsViewModel {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: AIJobsPhaseState;
  statusFilter: AIJobStatusFilter;
  rows: AIJobRow[];
  errorMessage?: string;
  successMessage?: string;
}
