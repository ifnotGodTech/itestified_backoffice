import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAnalyticsViewModel } from "@/features/admin/data/services/get-analytics-view-model";
import { AnalyticsPage } from "@/features/admin/presentation/components/analytics-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/analytics",
}));

afterEach(() => cleanup());

describe("AnalyticsPage", () => {
  test("renders testimony analytics", () => {
    render(<AnalyticsPage viewModel={getAnalyticsViewModel({})} />);
    expect(screen.getByRole("heading", { name: "Testimony Analytics" })).toBeInTheDocument();
    expect(screen.getByText("Performance Trends")).toBeInTheDocument();
    expect(screen.getByText("Engagement by Category")).toBeInTheDocument();
  });

  test("renders user analytics", () => {
    render(<AnalyticsPage viewModel={getAnalyticsViewModel({ area: "users" })} />);
    expect(screen.getByRole("heading", { name: "User Analytics" })).toBeInTheDocument();
    expect(screen.getByText("User Growth Overview")).toBeInTheDocument();
    expect(screen.getByText("Registered vs Active Users")).toBeInTheDocument();
  });

  test("renders donation analytics and empty/error states", () => {
    render(<AnalyticsPage viewModel={getAnalyticsViewModel({ area: "donations" })} />);
    expect(screen.getByRole("heading", { name: "Donation Analytics" })).toBeInTheDocument();
    expect(screen.getByText("Donation Channels")).toBeInTheDocument();
    cleanup();
    render(<AnalyticsPage viewModel={getAnalyticsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No analytics data available yet.")).toBeInTheDocument();
    cleanup();
    render(<AnalyticsPage viewModel={getAnalyticsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load analytics right now. Please try again.")).toBeInTheDocument();
  });
});
