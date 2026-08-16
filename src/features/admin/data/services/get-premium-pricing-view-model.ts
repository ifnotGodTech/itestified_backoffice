import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type { PremiumPricingRow, PremiumPricingState, PremiumPricingViewModel } from "@/features/admin/domain/entities/premium-pricing";

function normalizeState(state?: string): PremiumPricingState {
  if (state === "error" || state === "success" || state === "validation" || state === "gateway_error") return state;
  return "populated";
}

// Same minor/major-unit display convention already used on the
// Subscriptions list (get-subscriptions-view-model.ts): USD always shows
// cents (matches the exact price charged), NGN stays whole.
function formatAmount(amountMinor: number, currency: string) {
  const symbol = currency === "USD" ? "$" : currency === "NGN" ? "₦" : "";
  const amountMajor = amountMinor / 100;
  const formatted =
    currency === "USD"
      ? amountMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amountMajor.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${symbol}${formatted}`;
}

export function getPremiumPricingViewModel(input: { state?: string; fullName?: string }): PremiumPricingViewModel {
  const phaseState = normalizeState(input.state);
  return {
    shell: getAdminShellViewModel({ activeHref: "/subscriptions", fullName: input.fullName }),
    pageTitle: "Premium pricing",
    pageDescription:
      "Set the Premium subscription price per currency. Changing a price here only affects new subscribers going forward — everyone already subscribed keeps paying the price they originally agreed to, for the life of their subscription.",
    phaseState,
    rows: [],
    successMessage: phaseState === "success" ? "Price updated. New subscribers will be charged the new amount." : undefined,
    errorMessage:
      phaseState === "error" ? "Something went wrong loading or saving pricing. Please try again." : undefined,
    validationMessage:
      phaseState === "validation" ? "Enter a 3-letter currency code (e.g. NGN or USD) and an amount greater than zero." : undefined,
  };
}

export async function getPremiumPricingViewModelFromApi(
  input: { state?: string; fullName?: string },
  cookieHeader: string,
): Promise<PremiumPricingViewModel> {
  const vm = getPremiumPricingViewModel(input);
  try {
    const response = await fetch(`${backendBaseUrl}/subscriptions/admin/pricing/`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ...vm,
        phaseState: "error",
        errorMessage: "We could not load the current pricing right now. Please try again.",
      };
    }
    const payload = (await response.json().catch(() => [])) as Array<{
      currency: string;
      amount: number;
      provider_plan_id: string;
      updated_by_email: string;
      updated_at: string;
    }>;
    const rows: PremiumPricingRow[] = payload.map((item) => ({
      currency: item.currency,
      amountMinor: item.amount,
      amountLabel: formatAmount(item.amount, item.currency),
      providerPlanId: item.provider_plan_id,
      updatedByEmail: item.updated_by_email,
      updatedAt: item.updated_at,
    }));
    return {
      ...vm,
      rows,
      phaseState:
        input.state === "success" || input.state === "validation" || input.state === "error" || input.state === "gateway_error"
          ? vm.phaseState
          : "populated",
    };
  } catch {
    return {
      ...vm,
      phaseState: "error",
      errorMessage: "We could not load the current pricing right now. Please try again.",
    };
  }
}
