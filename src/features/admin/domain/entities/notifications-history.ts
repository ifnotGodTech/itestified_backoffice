import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type NotificationReadStatus = "read" | "unread";
export type NotificationsHistoryState = "populated" | "empty" | "loading" | "error";

export type NotificationHistoryRow = {
  id: number;
  title: string;
  message: string;
  date: string;
  time: string;
  status: NotificationReadStatus;
  href?: string;
};

export type NotificationsHistoryFilterDraft = {
  status?: NotificationReadStatus;
  from?: string;
  to?: string;
};

export type NotificationsHistoryViewModel = {
  shell: AdminShellViewModel;
  phaseState: NotificationsHistoryState;
  searchQuery: string;
  rows: NotificationHistoryRow[];
  selectedIds: number[];
  selectedRow: NotificationHistoryRow | null;
  showingLabel: string;
  errorMessage?: string;
  filterDraft: NotificationsHistoryFilterDraft;
  showPanel: boolean;
  showFilterModal: boolean;
  showDeleteModal: boolean;
  deleteMode?: "single" | "bulk";
  showSuccess: boolean;
  successMessage?: string;
};
