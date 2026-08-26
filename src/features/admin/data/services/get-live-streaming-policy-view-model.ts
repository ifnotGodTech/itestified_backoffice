import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import { backendBaseUrl } from "@/core/auth/backend";
import type {
  LiveMinutePricingRow,
  LiveStreamingPolicyForm,
  LiveStreamingPolicySection,
  LiveStreamingPolicyState,
  LiveStreamingPolicyViewModel,
  MinistryUsageRow,
  PendingApprovalRequestRow,
} from "@/features/admin/domain/entities/live-streaming-policy";

function normalizeState(state?: string): LiveStreamingPolicyState {
  if (state === "error" || state === "success" || state === "validation") return state;
  return "populated";
}

function normalizeSection(section?: string): LiveStreamingPolicySection | null {
  if (section === "policy" || section === "pricing" || section === "approval") return section;
  return null;
}

// Same minor/major-unit display convention already used on Premium
// Pricing (get-premium-pricing-view-model.ts): USD always shows cents,
// NGN stays whole.
function formatPriceLabel(amountMinor: number, currency: string) {
  const symbol = currency === "USD" ? "$" : currency === "NGN" ? "₦" : "";
  const amountMajor = amountMinor / 100;
  const formatted =
    currency === "USD"
      ? amountMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amountMajor.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${symbol}${formatted} / 1,000 min`;
}

function defaultPolicy(): LiveStreamingPolicyForm {
  return {
    isEnabled: true,
    maxConcurrentViewers: 50,
    maxDurationMinutes: 30,
    sharedMonthlyCeilingMinutes: 10000,
    defaultMinistryMonthlyAllowanceMinutes: 200,
    updatedByEmail: "",
    updatedAt: null,
  };
}

function messagesFor(phaseState: LiveStreamingPolicyState, section: LiveStreamingPolicySection | null) {
  if (phaseState === "success") {
    if (section === "pricing") return { successMessage: "Pricing updated." };
    if (section === "approval") return { successMessage: "Request decided." };
    return { successMessage: "Policy updated." };
  }
  if (phaseState === "validation") {
    return { validationMessage: "Check the values you entered and try again." };
  }
  if (phaseState === "error") {
    return { errorMessage: "Something went wrong. Please try again." };
  }
  return {};
}

export async function getLiveStreamingPolicyViewModelFromApi(
  input: { state?: string; section?: string; fullName?: string },
  cookieHeader: string,
): Promise<LiveStreamingPolicyViewModel> {
  const phaseState = normalizeState(input.state);
  const bannerSection = normalizeSection(input.section);
  const base: LiveStreamingPolicyViewModel = {
    shell: getAdminShellViewModel({ activeHref: "/live-broadcasts", fullName: input.fullName }),
    pageTitle: "Live Streaming Policy",
    pageDescription:
      "Configure per-broadcast caps, the shared monthly budget, and the self-service overage price. Changes apply immediately, with no deploy needed.",
    phaseState,
    bannerSection,
    policy: defaultPolicy(),
    pricingRows: [],
    platformUsage: { usedMinutes: null, sharedMonthlyCeilingMinutes: 10000 },
    ministryUsageRows: [],
    pendingApprovals: [],
    ...messagesFor(phaseState, bannerSection),
  };

  const headers: Record<string, string> = cookieHeader ? { cookie: cookieHeader } : {};
  try {
    const [policyRes, pricingRes, costRes, approvalsRes] = await Promise.all([
      fetch(`${backendBaseUrl}/live-broadcasts/admin/policy/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/live-broadcasts/admin/pricing/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/live-broadcasts/admin/cost-summary/`, { headers, cache: "no-store" }),
      fetch(`${backendBaseUrl}/live-broadcasts/admin/approval-requests/`, { headers, cache: "no-store" }),
    ]);

    if (!policyRes.ok || !pricingRes.ok || !costRes.ok || !approvalsRes.ok) {
      return { ...base, phaseState: "error", errorMessage: "We could not load this page right now. Please try again." };
    }

    const policyPayload = (await policyRes.json()) as Record<string, unknown>;
    const pricingPayload = (await pricingRes.json()) as Array<Record<string, unknown>>;
    const costPayload = (await costRes.json()) as {
      platform?: { used_minutes?: number | null; shared_monthly_ceiling_minutes?: number };
      ministries?: Array<Record<string, unknown>>;
    };
    const approvalsPayload = (await approvalsRes.json()) as Array<Record<string, unknown>>;

    const policy: LiveStreamingPolicyForm = {
      isEnabled: Boolean(policyPayload.is_enabled),
      maxConcurrentViewers: Number(policyPayload.max_concurrent_viewers ?? 0),
      maxDurationMinutes: Number(policyPayload.max_duration_minutes ?? 0),
      sharedMonthlyCeilingMinutes: Number(policyPayload.shared_monthly_ceiling_minutes ?? 0),
      defaultMinistryMonthlyAllowanceMinutes: Number(policyPayload.default_ministry_monthly_allowance_minutes ?? 0),
      updatedByEmail: String(policyPayload.updated_by_email ?? ""),
      updatedAt: (policyPayload.updated_at as string) ?? null,
    };

    const pricingRows: LiveMinutePricingRow[] = pricingPayload.map((item) => {
      const currency = String(item.currency ?? "");
      const amountMinor = Number(item.price_per_1000_minutes ?? 0);
      return {
        currency,
        pricePer1000MinutesMinor: amountMinor,
        priceLabel: formatPriceLabel(amountMinor, currency),
        updatedByEmail: String(item.updated_by_email ?? ""),
        updatedAt: (item.updated_at as string) ?? null,
      };
    });

    const ministryUsageRows: MinistryUsageRow[] = (costPayload.ministries ?? []).map((item) => ({
      ministryId: Number(item.ministry_id ?? 0),
      ministryName: String(item.ministry_name ?? ""),
      ministryAvatar: String(item.ministry_avatar ?? ""),
      baseAllowanceMinutes: Number(item.base_allowance_minutes ?? 0),
      purchasedMinutes: Number(item.purchased_minutes ?? 0),
      totalAllowanceMinutes: Number(item.total_allowance_minutes ?? 0),
      reservedMinutes: Number(item.reserved_minutes ?? 0),
      remainingMinutes: Number(item.remaining_minutes ?? 0),
    }));

    const pendingApprovals: PendingApprovalRequestRow[] = approvalsPayload.map((item) => ({
      id: Number(item.id ?? 0),
      broadcastId: Number(item.broadcast ?? 0),
      creatorEmail: String(item.creator_email ?? ""),
      requestedMinutes: Number(item.requested_minutes ?? 0),
      createdAtLabel: item.created_at
        ? new Date(String(item.created_at)).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
    }));

    return {
      ...base,
      policy,
      pricingRows,
      platformUsage: {
        usedMinutes: costPayload.platform?.used_minutes ?? null,
        sharedMonthlyCeilingMinutes: Number(costPayload.platform?.shared_monthly_ceiling_minutes ?? 10000),
      },
      ministryUsageRows,
      pendingApprovals,
    };
  } catch {
    return { ...base, phaseState: "error", errorMessage: "We could not load this page right now. Please try again." };
  }
}
