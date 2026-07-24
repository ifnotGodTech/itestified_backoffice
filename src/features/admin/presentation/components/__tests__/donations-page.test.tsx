import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getDonationsViewModel } from "@/features/admin/data/services/get-donations-view-model";
import { DonationsPage } from "@/features/admin/presentation/components/donations-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/donations",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
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

  test("switches donation tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "all";
        return Promise.resolve({
          ok: true,
          json: async () => getDonationsViewModel({ tab }),
        });
      }),
    );
    render(<DonationsPage viewModel={getDonationsViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Pending" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pending Donations" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Pending" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders empty and error states", () => {
    render(<DonationsPage viewModel={getDonationsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Donations Yet")).toBeInTheDocument();
    cleanup();
    render(<DonationsPage viewModel={getDonationsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load donations right now. Please try again.")).toBeInTheDocument();
    // Regression coverage for UI_UX_REVIEW_TODO.md B4: the header stat pills used to
    // keep showing fixture-derived numbers ("Donors (3)", "Total Donations (₦1,000,000)")
    // right next to this same error banner.
    expect(screen.getByText("Donors (—)")).toBeInTheDocument();
    expect(screen.getByText("Total Donations (—)")).toBeInTheDocument();
    expect(screen.queryByText("Donors (3)")).not.toBeInTheDocument();
    expect(screen.queryByText("Total Donations (₦1,000,000)")).not.toBeInTheDocument();
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

  test("reversal reason modal shows the real donation and requires a typed reason", async () => {
    // Regression coverage for Phase 5 Slice 7: this modal used to show a
    // hardcoded donor/email/transaction id and submit a hardcoded reason
    // ("Admin verification request") regardless of the selected donation or
    // what the admin typed, defeating the audit trail the backend builds.
    const user = userEvent.setup();
    render(<DonationsPage viewModel={getDonationsViewModel({ reason: "2" })} />);

    const modal = screen.getByRole("heading", { name: "Reverse Donation" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("Adamu Johnson")).toBeInTheDocument();
    expect(within(modal).getByText("chomuncho@site.com")).toBeInTheDocument();
    expect(within(modal).getByText("IY46HN5689")).toBeInTheDocument();
    expect(within(modal).queryByText("Akinlabi Jonah")).not.toBeInTheDocument();
    expect(within(modal).queryByText("KG08964FH89")).not.toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirm Reversal" });
    expect(confirmButton).toBeDisabled();

    const reasonField = screen.getByPlaceholderText("Explain why this donation is being reversed");
    await user.type(reasonField, "Duplicate charge reported by donor");

    expect(confirmButton).toBeEnabled();
    const form = confirmButton.closest("form");
    expect(form).toHaveAttribute(
      "action",
      expect.stringContaining(encodeURIComponent("Duplicate charge reported by donor")),
    );
  });

  test("donation detail modal fetches the full record from the admin detail endpoint", async () => {
    // Regression coverage for Phase 5 Slice 6: the modal used to render only
    // the fields already present on the list row (no provider, no status
    // history) instead of calling AdminDonationDetailView, so the backend's
    // full record was never actually surfaced to the admin.
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          donor: "Ben Bruce",
          email: "amanda@site.so",
          amount: "₦5,000",
          currency: "Naira (₦)",
          date: "05 Aug, 2025",
          status: "successful",
          reference: "KY23FN5325",
          paymentMethod: "Flutterwave",
          paymentMask: "****3709",
          provider: "flutterwave",
          statusReason: "",
          statusHistory: [
            {
              id: 1,
              fromStatus: "pending",
              toStatus: "successful",
              reason: "Payment confirmed by gateway",
              actorEmail: "system@itestified.org",
              date: "05 Aug, 2025",
            },
          ],
        }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DonationsPage viewModel={getDonationsViewModel({ detail: "1" })} />);

    expect(await screen.findByText("flutterwave")).toBeInTheDocument();
    expect(await screen.findByText("Payment confirmed by gateway")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/donations/1");
  });

  test("closes route-opened reverse modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/donations?reverse=2");
    render(<DonationsPage viewModel={getDonationsViewModel({ reverse: "2" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel reverse donation" }));

    expect(screen.queryByRole("heading", { name: "Reverse Donation" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/donations");
  });
});
