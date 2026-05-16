import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getReviewsViewModel } from "@/features/admin/data/services/get-reviews-view-model";
import { ReviewsPage } from "@/features/admin/presentation/components/reviews-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/reviews",
}));

afterEach(() => {
  cleanup();
});

describe("ReviewsPage", () => {
  test("renders the reviews table state", () => {
    render(<ReviewsPage viewModel={getReviewsViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Reviews", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("RE-001")).toBeInTheDocument();
    expect(screen.getByText("John Stone")).toBeInTheDocument();
  });

  test("renders menu, filter, and details states", () => {
    render(<ReviewsPage viewModel={getReviewsViewModel({ menu: "1" })} />);
    expect(screen.getByText("View details")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    cleanup();
    render(<ReviewsPage viewModel={getReviewsViewModel({ filter: "1", rating: "5" })} />);
    expect(screen.getByRole("heading", { name: "Filter" })).toBeInTheDocument();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    cleanup();
    render(<ReviewsPage viewModel={getReviewsViewModel({ view: "1" })} />);
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  test("renders delete, empty, and error states", () => {
    render(<ReviewsPage viewModel={getReviewsViewModel({ selected: "1,2,3", deleteAll: "1" })} />);
    expect(screen.getByRole("heading", { name: "Delete all reviews?" })).toBeInTheDocument();
    cleanup();
    render(<ReviewsPage viewModel={getReviewsViewModel({ remove: "1" })} />);
    expect(screen.getByRole("heading", { name: "Delete review?" })).toBeInTheDocument();
    cleanup();
    render(<ReviewsPage viewModel={getReviewsViewModel({ state: "empty" })} />);
    expect(screen.getByText("No Reviews Yet")).toBeInTheDocument();
    cleanup();
    render(<ReviewsPage viewModel={getReviewsViewModel({ state: "error" })} />);
    expect(screen.getByText("We could not load reviews right now. Please try again.")).toBeInTheDocument();
  });
});
