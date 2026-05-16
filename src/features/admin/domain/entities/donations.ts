import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type DonationTab = "all" | "successful" | "pending" | "declined" | "reversal";
export type DonationsState = "populated" | "empty" | "loading" | "error";

export type DonationRow = {
  id: number;
  donor: string;
  email: string;
  amount: string;
  currency: string;
  date: string;
  status: DonationTab;
  reference: string;
  paymentMethod: string;
  paymentMask: string;
};

export type DonationsFilterDraft = {
  minAmount?: string;
  maxAmount?: string;
  currency?: string;
  status?: DonationTab;
  from?: string;
  to?: string;
};

export type DonationsViewModel = {
  shell: AdminShellViewModel;
  activeTab: DonationTab;
  phaseState: DonationsState;
  pageTitle: string;
  pageDescription: string;
  selectedMonth: string;
  monthOptions: string[];
  searchQuery: string;
  tabs: Array<{ key: DonationTab; label: string }>;
  rows: DonationRow[];
  selectedRow: DonationRow | null;
  showingLabel: string;
  errorMessage?: string;
  filterDraft: DonationsFilterDraft;
  searchPlaceholder: string;
  topStats: Array<{
    label: string;
    value: string;
    tone: "info" | "accent";
  }>;
  heroCard?: {
    label: string;
    value: string;
    hint: string;
    trend: string;
  };
  tableTitle: string;
  tableBadge: {
    donorsLabel: string;
    totalLabel: string;
    totalTone: "info" | "success" | "warning" | "danger";
  };
  summary: {
    cards: Array<{
      label: string;
      value: string;
      tone?: "default" | "muted";
    }>;
  };
  showActionMenu: boolean;
  showMonthMenu: boolean;
  showFilterModal: boolean;
  showRefundConfirm: boolean;
  showReverseConfirm: boolean;
  showDeleteConfirm: boolean;
  showReasonModal: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
