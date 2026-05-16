import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { ReviewRow, ReviewsFilterDraft, ReviewsState, ReviewsViewModel } from "@/features/admin/domain/entities/reviews";

const reviews: ReviewRow[] = [
  {
    id: 1,
    reviewId: "RE-001",
    name: "John Stone",
    email: "Johnstone@gmail.com",
    review: "Great app experience...",
    rating: 5,
    dateSubmitted: "8th Aug 2024",
    avatarUrl: "/avatars/avatar-1.png",
  },
  {
    id: 2,
    reviewId: "RE-002",
    name: "Ubani Kelechi",
    email: "Ubanikelechi@gmail.com",
    review: "Could be improved...",
    rating: 4,
    dateSubmitted: "8th Aug 2024",
    avatarUrl: "/avatars/avatar-2.png",
  },
  {
    id: 3,
    reviewId: "RE-003",
    name: "Adu Oreoluwa",
    email: "Aduoreoluwa@gmail.com",
    review: "I love how simple it is",
    rating: 4,
    dateSubmitted: "8th Aug 2024",
    avatarUrl: "/avatars/avatar-3.png",
  },
];

function normalizeState(state?: string): ReviewsState {
  if (state === "empty" || state === "loading" || state === "error") return state;
  return "populated";
}

function parseIds(value?: string) {
  if (!value) return [] as number[];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
}

function applyFilter(rows: ReviewRow[], filterDraft: ReviewsFilterDraft, query: string) {
  return rows.filter((row) => {
    if (filterDraft.rating && row.rating !== filterDraft.rating) return false;
    if (query && !`${row.name} ${row.email} ${row.review}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
}

export function getReviewsViewModel(input: {
  state?: string;
  q?: string;
  filter?: string;
  rating?: string;
  from?: string;
  to?: string;
  selected?: string;
  menu?: string;
  view?: string;
  remove?: string;
  deleteAll?: string;
  fullName?: string;
}): ReviewsViewModel {
  const phaseState = normalizeState(input.state);
  const searchQuery = input.q?.trim() ?? "";
  const filterDraft: ReviewsFilterDraft = {
    rating: input.rating ? Number(input.rating) : undefined,
    from: input.from?.trim() || undefined,
    to: input.to?.trim() || undefined,
  };
  const rows = phaseState === "populated" ? applyFilter(reviews, filterDraft, searchQuery) : [];
  const selectedIds = parseIds(input.selected);
  const selectedRowId = Number(input.view ?? input.remove ?? "");
  const selectedRow = Number.isFinite(selectedRowId) ? reviews.find((row) => row.id === selectedRowId) ?? null : null;
  return {
    shell: getAdminShellViewModel({
      activeHref: "/reviews",
      fullName: input.fullName,
    }),
    phaseState,
    rows,
    selectedIds,
    selectedRow,
    filterDraft,
    showFilterModal: input.filter === "1",
    showMenuForId: input.menu ? Number(input.menu) : undefined,
    showDetailForId: input.view ? Number(input.view) : undefined,
    showDeleteModal: Boolean(input.deleteAll === "1" || input.remove),
    deleteMode: input.deleteAll === "1" ? "bulk" : input.remove ? "single" : undefined,
    showingLabel: rows.length === 0 ? "Showing 0 of 0" : `Showing 1-${rows.length} of ${rows.length}`,
    searchPlaceholder: "Search by name,email, user ID",
    bulkSearchPlaceholder: "Search by name,category",
    errorMessage: phaseState === "error" ? "We could not load reviews right now. Please try again." : undefined,
  };
}
