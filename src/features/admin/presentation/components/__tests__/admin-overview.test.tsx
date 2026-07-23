import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminOverviewViewModel } from "@/features/admin";
import { AdminOverview } from "@/features/admin/presentation/components/admin-overview";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/overview",
}));

afterEach(() => {
  cleanup();
});

describe("AdminOverview", () => {
  test("renders the filled overview state", () => {
    render(<AdminOverview viewModel={getAdminOverviewViewModel({ fullName: "Elvis Igiebor" })} />);

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Pending Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Pending Donations")).toBeInTheDocument();
    expect(screen.getByText("Top Engagement for video Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Financial Miracles")).toBeInTheDocument();
  });

  test("renders the empty overview state", () => {
    render(<AdminOverview viewModel={getAdminOverviewViewModel({ state: "empty" })} />);

    expect(screen.getByText("No Data here Yet")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.queryByText("S/N")).not.toBeInTheDocument();
  });

  // Regression coverage for UI_UX_REVIEW_TODO.md B2: a backend outage used to be visually
  // indistinguishable from "genuinely nothing pending" (both showed "0" and "No Data here Yet").
  test("renders a distinct error state instead of a silent zero", () => {
    render(<AdminOverview viewModel={getAdminOverviewViewModel({ state: "error" })} />);

    expect(screen.getByText("Unable to load your overview")).toBeInTheDocument();
    expect(screen.queryByText("No Data here Yet")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
