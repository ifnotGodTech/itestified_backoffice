import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type AdminOverviewTableRow = {
  id: number;
  category: string;
  type: string;
  likes: number;
  shares: number;
  comments: number;
  overall: number;
};

export type AdminOverviewMetric = {
  label: string;
  value: number;
};

export type AdminOverviewViewModel = {
  shell: AdminShellViewModel;
  metrics: AdminOverviewMetric[];
  rows: AdminOverviewTableRow[];
  empty: boolean;
};
