import type { AdminShellViewModel } from "@/features/admin/domain/entities/shell";

export type PremiumPricingState = "populated" | "error" | "success" | "validation" | "gateway_error";

export type PremiumPricingRow = {
  currency: string;
  amountMinor: number;
  amountLabel: string;
  providerPlanId: string;
  updatedByEmail: string;
  updatedAt: string | null;
};

export type PremiumPricingViewModel = {
  shell: AdminShellViewModel;
  pageTitle: string;
  pageDescription: string;
  phaseState: PremiumPricingState;
  rows: PremiumPricingRow[];
  successMessage?: string;
  errorMessage?: string;
  validationMessage?: string;
};
