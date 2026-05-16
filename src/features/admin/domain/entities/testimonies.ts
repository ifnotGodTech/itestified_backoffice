import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type TestimonyTab = "text" | "video";
export type TestimonyState = "populated" | "empty" | "loading" | "error";
export type VideoTestimonyScreen = "list" | "upload" | "activity";
export type WrittenTestimonyStatus = "Pending" | "Approved" | "Rejected";
export type VideoTestimonyStatus = "All" | "Uploaded" | "Scheduled" | "Drafts";
export type TestimonyStatus = WrittenTestimonyStatus | VideoTestimonyStatus;
export type TestimonyOrigin = "list" | "notification";

export type TextTestimonyRow = {
  kind: "text";
  id: number;
  testimonyId: string;
  name: string;
  email: string;
  category: string;
  dateSubmitted: string;
  likes: number;
  comments: number;
  shares: number;
  status: WrittenTestimonyStatus;
  avatarSrc?: string;
  body: string;
  approvedBy?: string;
};

export type VideoTestimonyRow = {
  kind: "video";
  id: number;
  title: string;
  category: string;
  source: string;
  dateUploaded: string;
  uploadedBy: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  status: Exclude<VideoTestimonyStatus, "All">;
  thumbnailSrc: string;
};

export type TestimonyRow = TextTestimonyRow | VideoTestimonyRow;

export type TestimonyFilterDraft = {
  from?: string;
  to?: string;
  category?: string;
  source?: string;
  status?: WrittenTestimonyStatus;
  categoryMenuOpen?: boolean;
  sourceMenuOpen?: boolean;
};

export type TestimoniesViewModel = {
  shell: AdminShellViewModel;
  activeTab: TestimonyTab;
  activeVideoStatus: VideoTestimonyStatus;
  activeVideoScreen: VideoTestimonyScreen;
  phaseState: TestimonyState;
  searchQuery: string;
  tabs: Array<{ key: TestimonyTab; label: string }>;
  videoStatusTabs: Array<{ key: VideoTestimonyStatus; label: string }>;
  rows: TestimonyRow[];
  selectedRow: TestimonyRow | null;
  totalRows: number;
  showingLabel: string;
  errorMessage?: string;
  showActionMenu: boolean;
  showDetails: boolean;
  showRejectModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showFilterModal: boolean;
  showSettingsModal: boolean;
  showSuccess: boolean;
  successMessage?: string;
  filterDraft: TestimonyFilterDraft;
  origin: TestimonyOrigin;
  detailReturnHref?: string;
};
