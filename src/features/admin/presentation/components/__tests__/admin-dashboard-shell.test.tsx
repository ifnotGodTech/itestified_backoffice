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

  // Regression coverage for UI_UX_REVIEW_TODO.md B5: the sidebar's "Notifications history"
  // badge used to be a hardcoded "10" shown regardless of the real unread count, disagreeing
  // with the header bell right next to it.
  test("sidebar Notifications history badge tracks the live unread count, not a hardcoded literal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 4 }),
      }),
    );

    render(
      <AdminDashboardShell viewModel={getAdminShellViewModel({ activeHref: "", fullName: "Elvis Igiebor" })} chrome>
        <div>Route content</div>
      </AdminDashboardShell>,
    );

    expect(screen.queryByText("10")).not.toBeInTheDocument();
    expect(await screen.findAllByText("4")).not.toHaveLength(0);

    vi.unstubAllGlobals();
  });
});
