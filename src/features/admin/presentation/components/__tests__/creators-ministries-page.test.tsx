import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getCreatorsMinistriesViewModel } from "@/features/admin/data/services/get-creators-ministries-view-model";
import { CreatorsMinistriesPage } from "@/features/admin/presentation/components/creators-ministries-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/creators-ministries",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("CreatorsMinistriesPage", () => {
  test("renders the verification-requests queue by default", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Creators & Ministries", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verification Requests" })).toHaveAttribute("aria-pressed", "true");
    // Fixture: only "Grace Restoration Ministries" and "Rivers of Mercy" are
    // unverified-and-requested; "Shiloh Chapel" (never requested) and
    // "New Life Fellowship" (already verified) must not appear here.
    expect(screen.getByText("Grace Restoration Ministries")).toBeInTheDocument();
    expect(screen.getByText("Rivers of Mercy")).toBeInTheDocument();
    expect(screen.queryByText("Shiloh Chapel")).not.toBeInTheDocument();
    expect(screen.queryByText("New Life Fellowship")).not.toBeInTheDocument();
  });

  test("switches tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "queue";
        return Promise.resolve({
          ok: true,
          json: async () => getCreatorsMinistriesViewModel({ tab }),
        });
      }),
    );
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Verified" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Verified Ministries" })).toBeInTheDocument();
    });
    expect(screen.getByText("New Life Fellowship")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verified" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders empty and error states", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ state: "empty" })} />);
    expect(screen.getByText("No pending verification requests")).toBeInTheDocument();
    cleanup();
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load Ministry profiles right now. Please try again.")).toBeInTheDocument();
  });

  test("action menu offers Verify for an unverified row and Revoke for a verified one", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ menu: "1" })} />);
    expect(screen.getByText("Verify Ministry")).toBeInTheDocument();
    expect(screen.queryByText("Revoke verification")).not.toBeInTheDocument();
    cleanup();
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ tab: "all", menu: "2" })} />);
    expect(screen.getByText("Revoke verification")).toBeInTheDocument();
    expect(screen.queryByText("Verify Ministry")).not.toBeInTheDocument();
  });

  test("renders the verify-confirm modal with the real Ministry name and a real form action", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ verify: "1" })} />);
    const modal = screen.getByRole("heading", { name: "Verify Ministry" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("Grace Restoration Ministries")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Yes, verify" });
    const form = confirmButton.closest("form");
    expect(form).toHaveAttribute("action", expect.stringContaining("/api/admin/creators-ministries/101/verify/"));
  });

  test("renders the revoke-confirm modal with a real form action", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ tab: "all", unverify: "2" })} />);
    const modal = screen.getByRole("heading", { name: "Revoke Verification" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("New Life Fellowship")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Yes, revoke" });
    const form = confirmButton.closest("form");
    expect(form).toHaveAttribute("action", expect.stringContaining("/api/admin/creators-ministries/102/unverify/"));
  });

  test("renders the success confirmation", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ success: "verify" })} />);
    expect(screen.getByText("Ministry verified successfully!")).toBeInTheDocument();
  });

  test("detail modal shows the full record straight from the row, no fetch needed", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ tab: "all", detail: "1" })} />);
    const modal = screen.getByRole("heading", { name: "Ministry Profile" }).closest("div") as HTMLElement;
    expect(within(modal).getByText("Grace Restoration Ministries")).toBeInTheDocument();
    expect(within(modal).getByText("grace.restoration@example.com")).toBeInTheDocument();
    expect(within(modal).getByText("412")).toBeInTheDocument();
    expect(within(modal).getByText("Requested")).toBeInTheDocument();
  });

  test("search filters rows by name or email on the client fixture", () => {
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ tab: "all", q: "rivers" })} />);
    expect(screen.getByText("Rivers of Mercy")).toBeInTheDocument();
    expect(screen.queryByText("Grace Restoration Ministries")).not.toBeInTheDocument();
  });

  test("closes route-opened verify modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/creators-ministries?verify=1");
    render(<CreatorsMinistriesPage viewModel={getCreatorsMinistriesViewModel({ verify: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel verification" }));

    expect(screen.queryByRole("heading", { name: "Verify Ministry" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/creators-ministries");
  });
});
