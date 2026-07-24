import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getUsersViewModel } from "@/features/admin/data/services/get-users-view-model";
import { UsersPage } from "@/features/admin/presentation/components/users-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/users",
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
});

describe("UsersPage", () => {
  test("renders the registered users table state", () => {
    render(<UsersPage viewModel={getUsersViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Registered")).toBeInTheDocument();
    expect(screen.getByText("Emmanuel Oreoluwa")).toBeInTheDocument();
  });

  test("renders the deleted accounts state", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "deleted" })} />);

    expect(screen.getByText("Deleted accounts")).toBeInTheDocument();
    expect(screen.getByText("Felix Stone")).toBeInTheDocument();
  });

  // Regression coverage: the "Deleted accounts" tab used to show a "Delete" button with no
  // onClick handler at all, next to per-row checkboxes hardcoded to checked+readOnly (always
  // "selected", impossible to toggle) — a fully decorative, misleading bulk-delete affordance
  // with no backing selection state or backend endpoint. Removed rather than left half-built.
  test("does not show the non-functional bulk-delete affordance on deleted accounts", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "deleted" })} />);

    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  test("switches user tabs on the client", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        const tab = new URL(url, "http://localhost").searchParams.get("tab") ?? "registered";
        return Promise.resolve({
          ok: true,
          json: async () => getUsersViewModel({ tab }),
        });
      }),
    );
    render(<UsersPage viewModel={getUsersViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Deleted accounts" }));

    await waitFor(() => {
      expect(screen.getByText("Felix Stone")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Deleted accounts" })).toHaveAttribute("aria-pressed", "true");
  });

  test("renders the empty state", () => {
    render(<UsersPage viewModel={getUsersViewModel({ state: "empty" })} />);

    expect(screen.getByText("No Data here Yet")).toBeInTheDocument();
  });

  test("renders the registered user profile modal", () => {
    render(<UsersPage viewModel={getUsersViewModel({ view: "2" })} />);

    expect(screen.getAllByText("User ID").length).toBeGreaterThan(0);
    expect(screen.getAllByText("John Stone").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Registered").length).toBeGreaterThan(0);
  });

  test("renders the deactivate account flow", () => {
    render(<UsersPage viewModel={getUsersViewModel({ deactivate: "1" })} />);

    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select/ })).toBeInTheDocument();
    expect(screen.getByText("Confirm Deactivation")).toBeInTheDocument();
  });

  test("closes route-opened deactivate modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/users?deactivate=1");
    render(<UsersPage viewModel={getUsersViewModel({ deactivate: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel deactivate account" }));

    expect(screen.queryByRole("heading", { name: "Deactivate Account" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/users");
  });

  test("renders the deactivation success state", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "deactivated", success: "deactivate" })} />);

    expect(screen.getAllByText("Account Deactivated Successfully!").length).toBeGreaterThan(0);
  });

  test("renders the reactivate account flow", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "deactivated", reactivate: "1" })} />);

    expect(screen.getByRole("heading", { name: "Reactivate Account?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select/ })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Additional Reason")).toBeInTheDocument();
    expect(screen.getByText("Reactivate")).toBeInTheDocument();
  });

  test("renders the reactivation success state", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "registered", success: "reactivate" })} />);

    expect(screen.getAllByText("Account Reactivated Successfully!").length).toBeGreaterThan(0);
  });

  test("renders the deactivated account detail state", () => {
    render(<UsersPage viewModel={getUsersViewModel({ tab: "deactivated", view: "1" })} />);

    expect(screen.getByText("Account Timeline")).toBeInTheDocument();
    expect(screen.getByText("Deactivation Reason")).toBeInTheDocument();
    expect(screen.getByText("By Ore Adu (Admin)")).toBeInTheDocument();
  });
});
