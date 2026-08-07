import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";
import type { AdminPaginationFields } from "@/features/admin/domain/entities/pagination";

export type SubscriptionTab = "all" | "pending" | "active" | "past_due" | "canceled" | "expired";
export type SubscriptionsState = "populated" | "empty" | "loading" | "error";

export type SubscriptionRow = {
  id: number;
  subscriber: string;
  email: string;
  amount: string;
  currency: string;
  date: string;
  status: SubscriptionTab;
  reference: string;
  renewsOn: string;
  cancelAtPeriodEnd: boolean;
};

export type SubscriptionStatusHistoryEntry = {
  id: number;
  fromStatus: string;
  toStatus: string;
  reason: string;
  actorEmail: string;
  date: string;
};

export type SubscriptionDetail = SubscriptionRow & {
  providerSubscriptionId: string;
  statusReason: string;
  statusHistory: SubscriptionStatusHistoryEntry[];
};

export type SubscriptionsViewModel = AdminPaginationFields & {
  shell: AdminShellViewModel;
  activeTab: SubscriptionTab;
  phaseState: SubscriptionsState;
  pageTitle: string;
  pageDescription: string;
  searchQuery: string;
  tabs: Array<{ key: SubscriptionTab; label: string }>;
  rows: SubscriptionRow[];
  selectedRow: SubscriptionRow | null;
  showingLabel: string;
  errorMessage?: string;
  searchPlaceholder: string;
  topStats: Array<{ label: string; value: string; tone: "info" | "accent" }>;
  tableTitle: string;
  tableBadge: { subscribersLabel: string };
  showActionMenu: boolean;
  showDetails: boolean;
  showCancelConfirm: boolean;
  showReasonModal: boolean;
  showSuccess: boolean;
  successMessage?: string;
};
