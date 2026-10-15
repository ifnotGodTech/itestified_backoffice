import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

// Phase 35 retired the featured testimonies (Video/Text tabs) and the
// section order: the app's Home is one immersive feed. What's left is the
// featured pictures woven into that feed.
export type HomeManagementTab = "pictures";
// Pictures track no engagement metric, so newest-first is the only rule.
export type HomeManagementDisplayRule = "Most Recent";
export type HomeManagementPhaseState = "populated" | "loading" | "empty" | "error";

export type HomeManagementRow = {
  id: number;
  kind: "picture";
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

export type HomeManagementViewModel = {
  shell: AdminShellViewModel;
  activeTab: HomeManagementTab;
  phaseState: HomeManagementPhaseState;
  displayRule: HomeManagementDisplayRule;
  displayRuleOptions: HomeManagementDisplayRule[];
  testimonyCount: number;
  availableCount: number;
  errorMessage?: string;
  rows: HomeManagementRow[];
  selectedRow: HomeManagementRow | null;
  showActionMenu: boolean;
  showDetails: boolean;
  showRemoveConfirm: boolean;
  showSuccess: boolean;
  featuredPictureOrder: HomeManagementFeaturedPicture[];
  availablePictures: HomeManagementAvailablePicture[];
};
