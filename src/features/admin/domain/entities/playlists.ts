import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

export type PlaylistVisibility = "private" | "shared";
export type PlaylistsPhaseState = "populated" | "empty" | "loading" | "error";
export type PlaylistTestimonyType = "written" | "video" | "audio";

export type PlaylistRow = {
  id: number;
  title: string;
  ownerName: string;
  ownerEmail: string;
  visibility: PlaylistVisibility;
  itemCount: number;
  createdAt: string;
};

export type PlaylistItemRow = {
  testimonyId: number;
  position: number;
  title: string;
  testimonyType: PlaylistTestimonyType;
  isAvailable: boolean;
};

export type PlaylistDetail = {
  id: number;
  title: string;
  ownerName: string;
  ownerEmail: string;
  visibility: PlaylistVisibility;
  showOwnerName: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  items: PlaylistItemRow[];
};

export type PlaylistTakedownAction = "force_private" | "delete";

export type PlaylistsViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  phaseState: PlaylistsPhaseState;
  errorMessage?: string;
  searchQuery: string;
  visibilityFilter: PlaylistVisibility | "";
  rows: PlaylistRow[];
  showingLabel: string;
  totalCount: number;
  sharedCount: number;
  detail: PlaylistDetail | null;
  detailError?: string;
  showTakedownModal: boolean;
};
