import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type TestimonyTab = "text" | "video";
export type TestimonyState = "populated" | "empty" | "loading" | "error";
export type VideoTestimonyScreen = "list" | "upload" | "activity";
export type WrittenTestimonyStatus = "Pending" | "Approved" | "Rejected" | "Scheduled" | "Archived";
export type VideoTestimonyStatus = "All" | "Uploaded" | "Scheduled" | "Drafts" | "Archived";
export type TestimonyStatus = WrittenTestimonyStatus | VideoTestimonyStatus;
export type TestimonyOrigin = "list" | "notification";
export type ModerationAction = "approved" | "rejected" | "scheduled" | "archived" | "auto_published";

export type ModerationHistoryItem = {
  id: number;
  action: ModerationAction;
  from_status: string;
  to_status: string;
  reason: string;
  publish_at?: string | null;
  created_at: string;
  actor_email?: string | null;
  actor_name?: string | null;
};

export type TextTestimonyRow = {
  kind: "text";
  id: number;
  title: string;
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
  moderationHistory?: ModerationHistoryItem[];
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
  moderationHistory?: ModerationHistoryItem[];
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

export type TestimonyCategoryOption = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
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
  categories: TestimonyCategoryOption[];
  rows: TestimonyRow[];
  selectedRow: TestimonyRow | null;
  totalRows: number;
  showingLabel: string;
  errorMessage?: string;
  showActionMenu: boolean;
  showDetails: boolean;
  showRejectModal: boolean;
  showScheduleModal: boolean;
  showArchiveModal: boolean;
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
