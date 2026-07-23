import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

export type InspirationalPictureState = "populated" | "empty" | "loading" | "error";
export type InspirationalPictureStatus = "All" | "Uploaded" | "Scheduled" | "Drafts";
export type InspirationalPictureScreen = "list" | "upload";

export type InspirationalPictureRow = {
  id: number;
  title: string;
  caption?: string;
  status: Exclude<InspirationalPictureStatus, "All">;
  category: string;
  uploadedBy: string;
  dateLabel: string;
  source: string;
  imageUrl?: string;
  scheduledTime?: string;
  downloadCount: number;
  shareCount: number;
  imageSrc: string;
};

export type InspirationalPicturesViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  activeStatus: InspirationalPictureStatus;
  activeScreen: InspirationalPictureScreen;
  phaseState: InspirationalPictureState;
  searchQuery: string;
  statusTabs: Array<{ key: InspirationalPictureStatus; label: string }>;
  rows: InspirationalPictureRow[];
  selectedRow: InspirationalPictureRow | null;
  totalRows: number;
  showingLabel: string;
  errorMessage?: string;
  showActionMenu: boolean;
  showDetails: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
