import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getReferralCommissionsViewModel } from "@/features/admin/data/services/get-referral-commissions-view-model";
import { ReferralCommissionsPage } from "@/features/admin/presentation/components/referral-commissions-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/referral-payouts",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("ReferralCommissionsPage", () => {
  test("renders the unpaid ledger by default", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Referral Payouts", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unpaid" })).toHaveAttribute("aria-pressed", "true");
    // Fixture: only row 1 is unpaid; row 2 is already paid and must not appear here.
    expect(screen.getByText("grace.restoration@example.com")).toBeInTheDocument();
    expect(screen.queryByText("office@newlifefellowship.org")).not.toBeInTheDocument();
  });

  test("switches tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "unpaid";
        return Promise.resolve({
          ok: true,
          json: async () => getReferralCommissionsViewModel({ tab }),
        });
      }),
    );
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Paid" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Paid Commissions" })).toBeInTheDocument();
    });
    expect(screen.getByText("office@newlifefellowship.org")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paid" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders empty and error states", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No unpaid commissions right now")).toBeInTheDocument();
    cleanup();
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load the commission ledger right now. Please try again.")).toBeInTheDocument();
  });

  test("action menu offers Mark as paid only for an unpaid row", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ menu: "1" })} />);
    expect(screen.getByText("Mark as paid")).toBeInTheDocument();
  });

  test("paid rows render no row-action menu button", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ tab: "paid" })} />);
    expect(screen.queryByLabelText(/Open actions for commission from office@newlifefellowship.org/)).not.toBeInTheDocument();
  });

  test("renders the mark-as-paid confirm modal with the real amount and a real form action", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ markPaid: "1" })} />);
    const modal = screen.getByRole("heading", { name: "Mark as Paid" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("NGN 450.00")).toBeInTheDocument();
    expect(within(modal).getByText("grace.restoration@example.com")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Yes, mark paid" });
    const form = confirmButton.closest("form");
    expect(form).toHaveAttribute("action", expect.stringContaining("/api/admin/referral-commissions/1/mark-paid/"));
  });

  test("renders the success confirmation", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ success: "mark-paid" })} />);
    expect(screen.getByText("Commission marked as paid!")).toBeInTheDocument();
  });

  test("search filters rows by referrer or referred email on the client fixture", () => {
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ tab: "all", q: "newlifefellowship" })} />);
    expect(screen.getByText("office@newlifefellowship.org")).toBeInTheDocument();
    expect(screen.queryByText("grace.restoration@example.com")).not.toBeInTheDocument();
  });

  test("closes route-opened mark-paid modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/referral-payouts?markPaid=1");
    render(<ReferralCommissionsPage viewModel={getReferralCommissionsViewModel({ markPaid: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Mark as Paid" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/referral-payouts");
  });
});
