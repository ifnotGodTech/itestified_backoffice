import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type HomeManagementTab = "video" | "text" | "pictures";
// "Most Shared" was dropped: no share metric exists anywhere in the backend
// (testimonies only track view_count/comment_count, pictures track neither),
// so it never had real data behind it. "Trending" now genuinely means
// "most viewed + commented", and is only offered where that data exists.
export type HomeManagementDisplayRule = "Trending" | "Most Recent";
export type HomeManagementPhaseState = "populated" | "loading" | "empty" | "error";

export type HomeManagementRow = {
  id: number;
  kind: "video" | "text" | "picture";
  title: string;
  category: string;
  source: string;
  dateUploaded: string;
  uploadedBy: string;
  submitterName?: string;
  submitterEmail?: string;
  body?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  downloads?: number;
  thumbnailLabel: string;
  thumbnailSrc?: string;
  status: "Uploaded";
};

export type HomeManagementSectionKey = "featured_testimonies" | "inspirational_picture" | "scripture";

export type HomeManagementFeaturedTestimony = {
  id: number;
  title: string;
  testimonyType: "video" | "text";
  createdAt: string;
  viewCount: number;
  commentCount: number;
};

export type HomeManagementAvailableTestimony = {
  id: number;
  title: string;
  category: string;
  testimonyType: "video" | "text";
};

export type HomeManagementFeaturedPicture = {
  id: number;
  title: string;
  createdAt: string;
};

export type HomeManagementAvailablePicture = {
  id: number;
  title: string;
  category: string;
};

export type HomeManagementSectionOrderItem = {
  key: HomeManagementSectionKey;
  label: string;
};

export type HomeManagementViewModel = {
  shell: AdminShellViewModel;
  activeTab: HomeManagementTab;
  phaseState: HomeManagementPhaseState;
  displayRule: HomeManagementDisplayRule;
  displayRuleOptions: HomeManagementDisplayRule[];
  testimonyCount: number;
  availableCount: number;
  errorMessage?: string;
  tabs: Array<{ key: HomeManagementTab; label: string }>;
  rows: HomeManagementRow[];
  selectedRow: HomeManagementRow | null;
  showActionMenu: boolean;
  showDetails: boolean;
  showRemoveConfirm: boolean;
  showSuccess: boolean;
  featuredOrder: HomeManagementFeaturedTestimony[];
  availableTestimonies: HomeManagementAvailableTestimony[];
  featuredPictureOrder: HomeManagementFeaturedPicture[];
  availablePictures: HomeManagementAvailablePicture[];
  sectionOrder: HomeManagementSectionOrderItem[];
};
