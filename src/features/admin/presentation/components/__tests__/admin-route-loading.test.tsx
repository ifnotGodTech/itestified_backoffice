import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AdminRouteLoading } from "@/features/admin/presentation/components/admin-route-loading";

describe("AdminRouteLoading", () => {
  test("shows a simple spinner for the route content instead of a fake page-shaped skeleton", () => {
    const { container } = render(<AdminRouteLoading />);

    expect(screen.getByRole("status", { name: "Dashboard content loading" })).toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  // Regression coverage: `(admin)/layout.tsx` (real sidebar/header) stays mounted across
  // client-side navigations under the same layout — only the page content Suspends. This
  // component used to rebuild a full fake sidebar+header, which rendered *nested inside*
  // the real, already-visible sidebar during a slow navigation — a literal sidebar-inside-
  // a-sidebar. It must never render sidebar/header chrome of its own.
  test("does not render a duplicate sidebar or header shell", () => {
    render(<AdminRouteLoading />);

    expect(screen.queryByText("Main Menu")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("iTestified")).not.toBeInTheDocument();
  });
});
