import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getAdminShellViewModel } from "@/features/admin";
import { AdminDashboardShell } from "@/features/admin/presentation/components/admin-dashboard-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/testimonies",
  useSearchParams: () => new URLSearchParams("tab=video"),
}));

afterEach(() => {
  cleanup();
});

describe("AdminDashboardShell", () => {
  test("renders persistent admin chrome around route content", () => {
    render(
      <AdminDashboardShell viewModel={getAdminShellViewModel({ activeHref: "", fullName: "Elvis Igiebor" })} chrome>
        <div>Route content</div>
      </AdminDashboardShell>,
    );

    expect(screen.getByText("Hello Admin")).toBeInTheDocument();
    expect(screen.getByText("Elvis Igiebor")).toBeInTheDocument();
    expect(screen.getByText("Main Menu")).toBeInTheDocument();
    expect(screen.getByText("Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Route content")).toBeInTheDocument();
  });
});
