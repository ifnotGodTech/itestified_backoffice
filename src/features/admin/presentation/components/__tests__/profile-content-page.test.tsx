import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getProfileContentViewModel } from "@/features/admin/data/services/get-profile-content-view-model";
import { ProfileContentPage } from "@/features/admin/presentation/components/profile-content-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/profile-content",
}));

afterEach(() => cleanup());

describe("ProfileContentPage", () => {
  test("renders every content key with an empty default and no crash", () => {
    render(<ProfileContentPage viewModel={getProfileContentViewModel({})} />);

    expect(screen.getByRole("heading", { name: "About & policies", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Terms of Use")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Support Email")).toBeInTheDocument();
    expect(screen.getByText("Support Phone")).toBeInTheDocument();
  });

  test("renders support email/phone as single-line inputs, not text areas", () => {
    const viewModel = getProfileContentViewModel({});
    viewModel.rows = viewModel.rows.map((row) =>
      row.key === "support_email"
        ? { key: "support_email", body: "help@itestified.app", updatedAt: null }
        : row,
    );

    render(<ProfileContentPage viewModel={viewModel} />);

    const emailInput = screen.getByDisplayValue("help@itestified.app");
    expect(emailInput.tagName).toBe("INPUT");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  test("pre-fills the body for a configured key", () => {
    const viewModel = getProfileContentViewModel({});
    viewModel.rows = viewModel.rows.map((row) =>
      row.key === "about_us" ? { key: "about_us", body: "Welcome to iTestified.", updatedAt: "2026-07-28T10:00:00Z" } : row,
    );

    render(<ProfileContentPage viewModel={viewModel} />);

    expect(screen.getByDisplayValue("Welcome to iTestified.")).toBeInTheDocument();
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  test("renders success, error, and validation states", () => {
    render(<ProfileContentPage viewModel={getProfileContentViewModel({ state: "success" })} />);
    expect(screen.getByText("Content updated successfully.")).toBeInTheDocument();
    cleanup();

    render(<ProfileContentPage viewModel={getProfileContentViewModel({ state: "error" })} />);
    expect(screen.getByText("Unable to load content")).toBeInTheDocument();
  });
});
