import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type ReviewsState = "populated" | "empty" | "loading" | "error";

export type ReviewRow = {
  id: number;
  reviewId: string;
  name: string;
  email: string;
  review: string;
  rating: number;
  dateSubmitted: string;
  avatarUrl: string;
};

export type ReviewsFilterDraft = {
  rating?: number;
  from?: string;
  to?: string;
};

export type ReviewsViewModel = {
  shell: AdminShellViewModel;
  phaseState: ReviewsState;
  rows: ReviewRow[];
  selectedIds: number[];
  selectedRow: ReviewRow | null;
  filterDraft: ReviewsFilterDraft;
  showFilterModal: boolean;
  showMenuForId?: number;
  showDetailForId?: number;
  showDeleteModal: boolean;
  deleteMode?: "single" | "bulk";
  showingLabel: string;
  searchPlaceholder: string;
  bulkSearchPlaceholder: string;
  errorMessage?: string;
};
