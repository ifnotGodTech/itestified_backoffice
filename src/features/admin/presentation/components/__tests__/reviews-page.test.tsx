import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getReviewsViewModel } from "@/features/admin/data/services/get-reviews-view-model";
import { ReviewsPage } from "@/features/admin/presentation/components/reviews-page";

const routerPush = vi.fn();
const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
  usePathname: () => "/reviews",
}));

afterEach(() => {
  cleanup();
  routerPush.mockClear();
  routerRefresh.mockClear();
  window.history.pushState(null, "", "/");
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

  test("opens and closes review menu locally", async () => {
    const user = userEvent.setup();
    render(<ReviewsPage viewModel={getReviewsViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Open review actions 1" }));

    expect(screen.getByRole("button", { name: "View details" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close review action menu" }));

    expect(screen.queryByRole("button", { name: "View details" })).not.toBeInTheDocument();
  });

  test("opens review filter and loaded details locally", async () => {
    const user = userEvent.setup();
    render(<ReviewsPage viewModel={getReviewsViewModel({})} />);

    await user.click(screen.getByRole("button", { name: "Filter" }));

    expect(screen.getByRole("heading", { name: "Filter" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss reviews filter" }));
    await user.click(screen.getByRole("button", { name: "Open review actions 1" }));
    await user.click(screen.getByRole("button", { name: "View details" }));

    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
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

  test("closes route-opened delete review modal without router navigation", async () => {
    const user = userEvent.setup();
    window.history.pushState(null, "", "/reviews?remove=1");
    render(<ReviewsPage viewModel={getReviewsViewModel({ remove: "1" })} />);

    await user.click(screen.getByRole("button", { name: "Cancel delete review" }));

    expect(screen.queryByRole("heading", { name: "Delete review?" })).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(window.location.pathname + window.location.search).toBe("/reviews");
  });
});
