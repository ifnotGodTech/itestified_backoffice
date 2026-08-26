import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminShellViewModel } from "@/features/admin/data/services/get-admin-shell-view-model";
import type { LiveStreamingPolicyViewModel } from "@/features/admin/domain/entities/live-streaming-policy";
import { LiveStreamingPolicyPage } from "@/features/admin/presentation/components/live-streaming-policy-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/live-broadcasts/policy",
}));

afterEach(() => cleanup());

function baseViewModel(overrides: Partial<LiveStreamingPolicyViewModel> = {}): LiveStreamingPolicyViewModel {
  return {
    shell: getAdminShellViewModel({ activeHref: "/live-broadcasts" }),
    pageTitle: "Live Streaming Policy",
    pageDescription: "Configure per-broadcast caps.",
    phaseState: "populated",
    bannerSection: null,
    policy: {
      isEnabled: true,
      maxConcurrentViewers: 50,
      maxDurationMinutes: 30,
      sharedMonthlyCeilingMinutes: 10000,
      defaultMinistryMonthlyAllowanceMinutes: 200,
      updatedByEmail: "",
      updatedAt: null,
    },
    pricingRows: [],
    platformUsage: { usedMinutes: 1234, sharedMonthlyCeilingMinutes: 10000 },
    ministryUsageRows: [],
    pendingApprovals: [],
    ...overrides,
  };
}

describe("LiveStreamingPolicyPage", () => {
  test("renders the current policy values and usage", () => {
    render(<LiveStreamingPolicyPage viewModel={baseViewModel()} />);

    expect(screen.getByRole("heading", { name: "Live Streaming Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("1,234 minutes used")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
  });

  test("renders an error state instead of the forms", () => {
    render(<LiveStreamingPolicyPage viewModel={baseViewModel({ phaseState: "error", errorMessage: "Backend is down." })} />);

    expect(screen.getByText("Unable to load this page")).toBeInTheDocument();
    expect(screen.getByText("Backend is down.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Policy" })).not.toBeInTheDocument();
  });

  test("renders per-Ministry usage rows", () => {
    render(
      <LiveStreamingPolicyPage
        viewModel={baseViewModel({
          ministryUsageRows: [
            {
              ministryId: 1,
              ministryName: "Grace Chapel",
              ministryAvatar: "",
              baseAllowanceMinutes: 200,
              purchasedMinutes: 0,
              totalAllowanceMinutes: 200,
              reservedMinutes: 150,
              remainingMinutes: 50,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Grace Chapel")).toBeInTheDocument();
    expect(screen.getByText(/150 \/ 200 min used/)).toBeInTheDocument();
  });

  test("renders a pending approval request with approve/reject actions", () => {
    render(
      <LiveStreamingPolicyPage
        viewModel={baseViewModel({
          pendingApprovals: [
            { id: 5, broadcastId: 9, creatorEmail: "ministry@example.com", requestedMinutes: 500, createdAtLabel: "25 Aug, 2026" },
          ],
        })}
      />,
    );

    expect(screen.getByText("ministry@example.com")).toBeInTheDocument();
    expect(screen.getByText(/Requesting 500 extra minutes for broadcast #9/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  test("renders the current overage price per currency", () => {
    render(
      <LiveStreamingPolicyPage
        viewModel={baseViewModel({
          pricingRows: [{ currency: "NGN", pricePer1000MinutesMinor: 500000, priceLabel: "₦5,000 / 1,000 min", updatedByEmail: "", updatedAt: null }],
        })}
      />,
    );

    expect(screen.getByText("NGN")).toBeInTheDocument();
    expect(screen.getByText("₦5,000 / 1,000 min")).toBeInTheDocument();
  });

  test("shows a success banner after a save", () => {
    render(<LiveStreamingPolicyPage viewModel={baseViewModel({ phaseState: "success", bannerSection: "pricing", successMessage: "Pricing updated." })} />);
    expect(screen.getByText("Pricing updated.")).toBeInTheDocument();
  });
});
