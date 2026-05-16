import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getUsersViewModel } from "@/features/admin/data/services/get-users-view-model";
import { UsersPage } from "@/features/admin/presentation/components/users-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/users",
}));

afterEach(() => {
  cleanup();
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
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByText("Felix Stone")).toBeInTheDocument();
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
