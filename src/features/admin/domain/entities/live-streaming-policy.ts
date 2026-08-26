import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type LiveStreamingPolicyState = "populated" | "error" | "success" | "validation";
export type LiveStreamingPolicySection = "policy" | "pricing" | "approval";

export type LiveStreamingPolicyForm = {
  isEnabled: boolean;
  maxConcurrentViewers: number;
  maxDurationMinutes: number;
  sharedMonthlyCeilingMinutes: number;
  defaultMinistryMonthlyAllowanceMinutes: number;
  updatedByEmail: string;
  updatedAt: string | null;
};

export type LiveMinutePricingRow = {
  currency: string;
  pricePer1000MinutesMinor: number;
  priceLabel: string;
  updatedByEmail: string;
  updatedAt: string | null;
};

export type PlatformUsageSummary = {
  usedMinutes: number | null;
  sharedMonthlyCeilingMinutes: number;
};

export type MinistryUsageRow = {
  ministryId: number;
  ministryName: string;
  ministryAvatar: string;
  baseAllowanceMinutes: number;
  purchasedMinutes: number;
  totalAllowanceMinutes: number;
  reservedMinutes: number;
  remainingMinutes: number;
};

export type PendingApprovalRequestRow = {
  id: number;
  broadcastId: number;
  creatorEmail: string;
  requestedMinutes: number;
  createdAtLabel: string;
};

export type LiveStreamingPolicyViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: LiveStreamingPolicyState;
  bannerSection: LiveStreamingPolicySection | null;
  policy: LiveStreamingPolicyForm;
  pricingRows: LiveMinutePricingRow[];
  platformUsage: PlatformUsageSummary;
  ministryUsageRows: MinistryUsageRow[];
  pendingApprovals: PendingApprovalRequestRow[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
