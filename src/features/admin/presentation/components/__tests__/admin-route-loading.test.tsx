import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AdminRouteLoading } from "@/features/admin/presentation/components/admin-route-loading";

describe("AdminRouteLoading", () => {
  test("preserves the dashboard shell while route content loads", () => {
    render(<AdminRouteLoading />);

    expect(screen.getByRole("status", { name: "Dashboard content loading" })).toBeInTheDocument();
    expect(screen.getByText("Hello Admin")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Testimonies")).toBeInTheDocument();
    expect(screen.getByText("Admin Management")).toBeInTheDocument();
  });

  // Regression coverage: the content area used to fake a specific "wide data table" page
  // shape (headers, rows, pagination) that didn't match most destination pages (Profile,
  // Notification Settings, Analytics, etc.). Replaced with a shape-agnostic spinner.
  test("shows a simple spinner for the route content instead of a fake page-shaped skeleton", () => {
    const { container } = render(<AdminRouteLoading />);

    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });
});
