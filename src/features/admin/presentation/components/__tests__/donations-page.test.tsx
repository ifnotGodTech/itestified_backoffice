import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getDonationsViewModel } from "@/features/admin/data/services/get-donations-view-model";
import { DonationsPage } from "@/features/admin/presentation/components/donations-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/donations",
}));

afterEach(() => {
  cleanup();
});

describe("DonationsPage", () => {
  test("renders the donations table state", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Donations history", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("All Donations").length).toBeGreaterThan(0);
    expect(screen.getByText("KY23FN5325")).toBeInTheDocument();
  });

  test("renders the month dropdown state", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({ tab: "successful", monthMenu: "1" })} />);
    expect(screen.getByRole("link", { name: /June/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "May" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "August" })).toBeInTheDocument();
  });

  test("renders empty and error states", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Donations Yet")).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load donations right now. Please try again.")).toBeInTheDocument();
  });

  test("renders filter and action states", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({ filter: "1" })} />);
    const filterModal = screen.getByRole("heading", { name: "Filter" }).closest("form");
    expect(filterModal).not.toBeNull();
    expect(filterModal).toHaveTextContent("Amount");
    expect(screen.getByText("Currency")).toBeInTheDocument();
    expect(filterModal).toHaveTextContent("Status");
    expect(filterModal).toHaveTextContent("Date Range");
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ menu: "1" })} />);
    expect(screen.getByText("Reverse donation")).toBeInTheDocument();
  });

  test("renders refund, reverse, reason, delete, and success states", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({ refund: "1" })} />);
    expect(screen.getByText("Refund Successful")).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ reverse: "2" })} />);
    expect(screen.getByRole("heading", { name: "Reverse Donation" })).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ reason: "2" })} />);
    expect(screen.getByRole("heading", { name: "Reverse Donation" })).toBeInTheDocument();
    expect(screen.getByText("Reason for Reversal")).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ remove: "1" })} />);
    expect(screen.getByRole("heading", { name: "Delete Donation?" })).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ success: "refund" })} />);
    expect(screen.getByText("Refund Successful")).toBeInTheDocument();
  });
});
