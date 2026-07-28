import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type HelpFaqRow = {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  updatedAt: string | null;
};

export type HelpFaqViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  rows: HelpFaqRow[];
  loadError?: string;
};
