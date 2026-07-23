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
    render(<AdminOverview viewModel={getAdminOverviewViewModel({ empty: true })} />);

    expect(screen.getByText("No Data here Yet")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.queryByText("S/N")).not.toBeInTheDocument();
  });
});
