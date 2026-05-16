import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getTestimoniesViewModel } from "@/features/admin/data/services/get-testimonies-view-model";
import { TestimoniesPage } from "@/features/admin/presentation/components/testimonies-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/testimonies",
}));

afterEach(() => {
  cleanup();
});

describe("TestimoniesPage", () => {
  test("renders the testimonies table state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({})} />);

    expect(screen.getByRole("heading", { name: "Testimonies" })).toBeInTheDocument();
    expect(screen.getByText("Testimony")).toBeInTheDocument();
    expect(screen.getByText("Emmanuel Oreoluwa")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });

  test("renders the video testimonies table state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video" })} />);

    expect(screen.getAllByText("Uploaded").length).toBeGreaterThan(0);
    expect(screen.getAllByText("God Healed Me").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Drafts").length).toBeGreaterThan(0);
  });

  test("renders the pending testimony detail state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ view: "1" })} />);

    expect(screen.getByText("Miraculous Healing After Prayer")).toBeInTheDocument();
    expect(screen.getByText("Approve Testimony")).toBeInTheDocument();
    expect(screen.getByText("Reject Testimony")).toBeInTheDocument();
  });

  test("renders the approved testimony detail state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ view: "2" })} />);

    expect(screen.getByText("Engagement Analytics")).toBeInTheDocument();
    expect(screen.getByText("Approved By")).toBeInTheDocument();
  });

  test("renders testimony detail opened from notifications", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ view: "1", origin: "notification" })} />);

    expect(screen.getByText("Opened from notifications history.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to notifications" })).toHaveAttribute("href", "/notifications-history");
  });

  test("renders the video details state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", view: "1" })} />);

    expect(screen.getByRole("heading", { name: "Video Details" })).toBeInTheDocument();
    expect(screen.getByText("Upload Date")).toBeInTheDocument();
    expect(screen.getAllByText("Uploaded").length).toBeGreaterThan(0);
  });

  test("renders the edit scheduled video state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", edit: "2" })} />);

    expect(screen.getByRole("heading", { name: "Edit Video testimony" })).toBeInTheDocument();
    expect(screen.getByText("Scheduled date")).toBeInTheDocument();
    expect(screen.getAllByText("Upload").length).toBeGreaterThan(0);
  });

  test("renders the reject testimony modal", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ reject: "1" })} />);

    expect(screen.getByRole("heading", { name: "Reject Testimony" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  test("renders the delete text testimony modal", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ remove: "2" })} />);

    expect(screen.getByRole("heading", { name: "Delete Testimony?" })).toBeInTheDocument();
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
  });

  test("renders the approval success state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ success: "approve" })} />);

    expect(screen.getAllByText("Testimony Approved Successfully!").length).toBeGreaterThan(0);
  });

  test("renders the upload success state", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", success: "upload" })} />);

    expect(screen.getAllByText("Video Uploaded Successfully!").length).toBeGreaterThan(0);
  });

  test("renders the video upload screen", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", screen: "upload" })} />);

    expect(screen.getByRole("heading", { name: "Upload Video Testimonies" })).toBeInTheDocument();
    expect(screen.getByText("Single Video Upload")).toBeInTheDocument();
    expect(screen.getByText("Upload Status")).toBeInTheDocument();
  });

  test("renders the testimony settings modal", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", settings: "1" })} />);

    expect(screen.getByRole("heading", { name: "Testimony Settings" })).toBeInTheDocument();
    expect(screen.getByText("Save Settings")).toBeInTheDocument();
  });

  test("renders the activity log screen", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", screen: "activity" })} />);

    expect(screen.getByRole("heading", { name: "Activity Log for Text Testimonies" })).toBeInTheDocument();
    expect(screen.getByText("Export as CSV File")).toBeInTheDocument();
    expect(screen.getAllByText("Ore Ore").length).toBeGreaterThan(0);
  });

  test("renders the filter modal", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ filter: "1" })} />);

    expect(screen.getAllByText("Filter").length).toBeGreaterThan(0);
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
    expect(screen.getByText("Approval Status")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  test("renders the video filter modal", () => {
    render(<TestimoniesPage viewModel={getTestimoniesViewModel({ tab: "video", filter: "1" })} />);

    expect(screen.getAllByText("Filter").length).toBeGreaterThan(0);
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Source").length).toBeGreaterThan(0);
    expect(screen.getByText("Video Filter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });
});
