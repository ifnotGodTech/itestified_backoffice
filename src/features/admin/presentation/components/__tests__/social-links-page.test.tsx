import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getSocialLinksViewModel } from "@/features/admin/data/services/get-social-links-view-model";
import { SocialLinksPage } from "@/features/admin/presentation/components/social-links-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/social-links",
}));

afterEach(() => cleanup());

describe("SocialLinksPage", () => {
  test("renders every platform with an empty default and no crash", () => {
    render(<SocialLinksPage viewModel={getSocialLinksViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Follow links", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });

  test("pre-fills the URL and active state for a configured platform", () => {
    const viewModel = getSocialLinksViewModel({});
    viewModel.rows = viewModel.rows.map((row) =>
      row.platform === "instagram"
        ? { platform: "instagram", url: "https://instagram.com/itestified", isActive: true, updatedAt: "2026-07-28T10:00:00Z" }
        : row,
    );

    render(<SocialLinksPage viewModel={viewModel} />);

    expect(screen.getByDisplayValue("https://instagram.com/itestified")).toBeInTheDocument();
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  test("renders success, error, and validation states", () => {
    render(<SocialLinksPage viewModel={getSocialLinksViewModel({ state: "success" })} />);
    expect(screen.getByText("Follow links updated successfully.")).toBeInTheDocument();
    cleanup();

    render(<SocialLinksPage viewModel={getSocialLinksViewModel({ state: "validation" })} />);
    expect(screen.getByText("Enter a valid URL for each link you turn on.")).toBeInTheDocument();
    cleanup();

    render(<SocialLinksPage viewModel={getSocialLinksViewModel({ state: "error" })} />);
    expect(screen.getByText("Unable to load follow links")).toBeInTheDocument();
  });
});
