import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

// Phase 23 Slice 5 -- "queue" and "unverified" both read from the same
// backend is_verified=false set; "queue" additionally requires
// verification_requested_at to be set (verification_requested=true).
export type CreatorMinistryTab = "queue" | "all" | "verified" | "unverified";
export type CreatorsMinistriesState = "populated" | "empty" | "loading" | "error";

export type CreatorMinistryRow = {
  id: number;
  userId: number;
  displayName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  verifiedAt: string | null;
  verificationRequestedAt: string | null;
  verifiedByEmail: string | null;
  followerCount: number;
  createdAt: string;
};

export type CreatorsMinistriesViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  activeTab: CreatorMinistryTab;
  phaseState: CreatorsMinistriesState;
  pageTitle: string;
  pageDescription: string;
  searchQuery: string;
  tabs: Array<{ key: CreatorMinistryTab; label: string }>;
  rows: CreatorMinistryRow[];
  selectedRow: CreatorMinistryRow | null;
  showingLabel: string;
  errorMessage?: string;
  searchPlaceholder: string;
  topStats: Array<{ label: string; value: string; tone: "info" | "accent" }>;
  tableTitle: string;
  tableBadge: { totalLabel: string };
  showActionMenu: boolean;
  showDetails: boolean;
  showVerifyConfirm: boolean;
  showUnverifyConfirm: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
