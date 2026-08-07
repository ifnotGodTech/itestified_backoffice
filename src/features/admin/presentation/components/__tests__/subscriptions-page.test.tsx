import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getSubscriptionsViewModel } from "@/features/admin/data/services/get-subscriptions-view-model";
import { SubscriptionsPage } from "@/features/admin/presentation/components/subscriptions-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/subscriptions",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("SubscriptionsPage", () => {
  test("renders the subscriptions table state", () => {
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Subscriptions", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("All Subscriptions").length).toBeGreaterThan(0);
    expect(screen.getByText("SUB-KY23FN5325")).toBeInTheDocument();
  });

  test("switches subscription tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "all";
        return Promise.resolve({
          ok: true,
          json: async () => getSubscriptionsViewModel({ tab }),
        });
      }),
    );
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Pending" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pending Subscriptions" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Pending" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders empty and error states", () => {
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Subscriptions Yet")).toBeInTheDocument();
    cleanup();
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load subscriptions right now. Please try again.")).toBeInTheDocument();
    expect(screen.getByText("Subscribers (—)")).toBeInTheDocument();
  });

  test("renders the action menu with a cancel link for a cancelable subscription", () => {
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ menu: "1" })} />);
    expect(screen.getByText("Cancel subscription")).toBeInTheDocument();
  });

  test("does not offer canceling a subscription already scheduled to cancel", () => {
    // Row 4 (SUB-NG52KG878) is fixture data with cancelAtPeriodEnd: true.
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ menu: "4" })} />);
    expect(screen.queryByText("Cancel subscription")).not.toBeInTheDocument();
  });

  test("renders cancel-confirm, reason, and success states", () => {
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ cancel: "1" })} />);
    expect(screen.getByRole("heading", { name: "Cancel Subscription" })).toBeInTheDocument();
    cleanup();
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ reason: "1" })} />);
    expect(screen.getByRole("heading", { name: "Cancel Subscription" })).toBeInTheDocument();
    expect(screen.getByText("Reason for cancellation")).toBeInTheDocument();
    cleanup();
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ success: "cancel" })} />);
    expect(screen.getByText("Subscription canceled successfully!")).toBeInTheDocument();
  });

  test("cancellation reason modal shows the real subscription and requires a typed reason", async () => {
    const user = userEvent.setup();
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ reason: "2" })} />);

    const modal = screen.getByRole("heading", { name: "Cancel Subscription" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("Adamu Johnson")).toBeInTheDocument();
    expect(within(modal).getByText("chomuncho@site.com")).toBeInTheDocument();
    expect(within(modal).getByText("SUB-IY46HN5689")).toBeInTheDocument();
    expect(within(modal).queryByText("Ben Bruce")).not.toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirm Cancellation" });
    expect(confirmButton).toBeDisabled();

    const reasonField = screen.getByPlaceholderText("Explain why this subscription is being canceled");
    await user.type(reasonField, "Customer requested a refund via support ticket");

    expect(confirmButton).toBeEnabled();
    const form = confirmButton.closest("form");
    expect(form).toHaveAttribute(
      "action",
      expect.stringContaining(encodeURIComponent("Customer requested a refund via support ticket")),
    );
  });

  test("subscription detail modal fetches the full record from the admin detail endpoint", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          subscriber: "Ben Bruce",
          email: "amanda@site.so",
          amount: "₦3,000",
          currency: "Naira (₦)",
          date: "05 Aug, 2026",
          status: "active",
          reference: "SUB-KY23FN5325",
          renewsOn: "05 Sep, 2026",
          cancelAtPeriodEnd: false,
          providerSubscriptionId: "fw-sub-1",
          statusReason: "",
          statusHistory: [
            {
              id: 1,
              fromStatus: "pending",
              toStatus: "active",
              reason: "Payment confirmed by gateway",
              actorEmail: "system@itestified.org",
              date: "05 Aug, 2026",
            },
          ],
        }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ detail: "1" })} />);

    expect(await screen.findByText("Payment confirmed by gateway")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/subscriptions/1");
  });

  test("closes route-opened cancel modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/subscriptions?cancel=1");
    render(<SubscriptionsPage viewModel={getSubscriptionsViewModel({ cancel: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Keep subscription" }));

    expect(screen.queryByRole("heading", { name: "Cancel Subscription" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/subscriptions");
  });
});
