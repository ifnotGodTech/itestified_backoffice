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
});
