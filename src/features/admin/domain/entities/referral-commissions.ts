import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

// Phase 24 Slice 3 -- "unpaid" is the actionable set (what still needs a
// manual bank transfer this month) so it's the default tab, same reasoning
// as Phase 23 Slice 5's "queue" tab defaulting the Ministry review screen
// to what actually needs attention.
export type ReferralCommissionTab = "unpaid" | "paid" | "all";
export type ReferralCommissionsState = "populated" | "empty" | "loading" | "error";

export type ReferralCommissionRow = {
  id: number;
  referrerEmail: string;
  referredUserEmail: string;
  amount: number;
  currency: string;
  ratePercent: string;
  billingPeriodEnd: string;
  isPaid: boolean;
  paidAt: string | null;
  paidByEmail: string | null;
  createdAt: string;
};

export type ReferralCommissionsViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  activeTab: ReferralCommissionTab;
  phaseState: ReferralCommissionsState;
  pageTitle: string;
  pageDescription: string;
  searchQuery: string;
  tabs: Array<{ key: ReferralCommissionTab; label: string }>;
  rows: ReferralCommissionRow[];
  selectedRow: ReferralCommissionRow | null;
  showingLabel: string;
  errorMessage?: string;
  searchPlaceholder: string;
  topStats: Array<{ label: string; value: string; tone: "info" | "accent" }>;
  tableTitle: string;
  tableBadge: { totalLabel: string };
  showActionMenu: boolean;
  showMarkPaidConfirm: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
