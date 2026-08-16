import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getPremiumPricingViewModel } from "@/features/admin/data/services/get-premium-pricing-view-model";
import { PremiumPricingPage } from "@/features/admin/presentation/components/premium-pricing-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/subscriptions/pricing",
}));

afterEach(() => cleanup());

describe("PremiumPricingPage", () => {
  test("renders an empty state and no crash when nothing is priced yet", () => {
    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Premium pricing", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/No price configured for any currency yet/)).toBeInTheDocument();
  });

  test("renders a row per configured currency with its formatted amount", () => {
    const viewModel = getPremiumPricingViewModel({});
    viewModel.rows = [
      {
        currency: "NGN",
        amountMinor: 300000,
        amountLabel: "₦3,000",
        providerPlanId: "plan_ngn",
        updatedByEmail: "admin@example.com",
        updatedAt: "2026-08-15T10:00:00Z",
      },
      {
        currency: "USD",
        amountMinor: 499,
        amountLabel: "$4.99",
        providerPlanId: "plan_usd",
        updatedByEmail: "",
        updatedAt: null,
      },
    ];

    render(<PremiumPricingPage viewModel={viewModel} />);

    expect(screen.getByText("NGN")).toBeInTheDocument();
    expect(screen.getByText("₦3,000")).toBeInTheDocument();
    expect(screen.getByText(/Last set/)).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("$4.99")).toBeInTheDocument();
    expect(screen.getByText("Not set yet")).toBeInTheDocument();
  });

  test("renders success, validation, gateway-error, and error states", () => {
    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({ state: "success" })} />);
    expect(screen.getByText(/Price updated/)).toBeInTheDocument();
    cleanup();

    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({ state: "validation" })} />);
    expect(screen.getByText(/Enter a 3-letter currency code/)).toBeInTheDocument();
    cleanup();

    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({ state: "gateway_error" })} />);
    expect(screen.getByText(/Flutterwave rejected this price/)).toBeInTheDocument();
    cleanup();

    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({ state: "error" })} />);
    expect(screen.getByText("Unable to load pricing")).toBeInTheDocument();
  });

  test("the set-price form posts currency and amount to the pricing API route", () => {
    render(<PremiumPricingPage viewModel={getPremiumPricingViewModel({})} />);

    const form = screen.getByRole("button", { name: "Save Price" }).closest("form");
    expect(form).toHaveAttribute("action", "/api/admin/subscriptions/pricing");
    expect(form).toHaveAttribute("method", "POST");
    expect(screen.getByPlaceholderText("e.g. NGN or USD")).toHaveAttribute("name", "currency");
    expect(screen.getByPlaceholderText("e.g. 3000")).toHaveAttribute("name", "amount");
  });
});
