import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type InspirationalPictureState = "populated" | "empty" | "loading" | "error";
export type InspirationalPictureStatus = "All" | "Uploaded" | "Scheduled" | "Drafts";
export type InspirationalPictureScreen = "list" | "upload";

export type InspirationalPictureRow = {
  id: number;
  title: string;
  status: Exclude<InspirationalPictureStatus, "All">;
  category: string;
  uploadedBy: string;
  dateLabel: string;
  source: string;
  scheduledTime?: string;
  downloadCount: number;
  shareCount: number;
  imageSrc: string;
};

export type InspirationalPicturesViewModel = {
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
